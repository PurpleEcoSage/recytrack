const { app, BrowserWindow, Menu, Tray, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const { spawn } = require('child_process');
const fs = require('fs');

// Configuration du store pour les préférences
const store = new Store();

// Variables globales
let mainWindow;
let tray;
let backendProcess;
let postgresProcess;

// Configuration des chemins
const FRONTEND_URL = isDev 
  ? 'http://localhost:3000' 
  : `file://${path.join(__dirname, 'build/index.html')}`;

const BACKEND_PATH = isDev
  ? path.join(__dirname, '../backend-setup')
  : path.join(process.resourcesPath, 'backend');

// Fonction pour démarrer PostgreSQL embarqué (Windows uniquement)
async function startPostgreSQL() {
  if (isDev) return; // En dev, PostgreSQL est externe

  try {
    const postgresPath = path.join(process.resourcesPath, 'postgresql/bin/postgres');
    const dataPath = path.join(app.getPath('userData'), 'pgdata');
    
    // Initialiser la base si nécessaire
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
      
      // Initialiser PostgreSQL
      const initdb = spawn(path.join(process.resourcesPath, 'postgresql/bin/initdb'), [
        '-D', dataPath,
        '-U', 'recytrack',
        '--encoding=UTF8'
      ]);
      
      await new Promise((resolve) => {
        initdb.on('close', resolve);
      });
    }

    // Démarrer PostgreSQL
    postgresProcess = spawn(postgresPath, [
      '-D', dataPath,
      '-p', '5432'
    ]);

    console.log('PostgreSQL démarré');
    
    // Attendre que PostgreSQL soit prêt
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Créer la base de données si elle n'existe pas
    const createdb = spawn(path.join(process.resourcesPath, 'postgresql/bin/createdb'), [
      '-U', 'recytrack',
      'recytrack'
    ]);
    
    await new Promise((resolve) => {
      createdb.on('close', resolve);
    });
    
  } catch (error) {
    console.error('Erreur démarrage PostgreSQL:', error);
    // En cas d'erreur, proposer d'utiliser PostgreSQL externe
    dialog.showMessageBox(null, {
      type: 'warning',
      title: 'PostgreSQL non disponible',
      message: 'PostgreSQL embarqué n\'a pas pu démarrer. Assurez-vous qu\'une instance PostgreSQL est installée et accessible sur localhost:5432',
      buttons: ['OK']
    });
  }
}

// Fonction pour démarrer le backend
async function startBackend() {
  try {
    const nodePath = isDev ? 'node' : path.join(process.resourcesPath, 'node/node');
    
    backendProcess = spawn(nodePath, ['server.js'], {
      cwd: BACKEND_PATH,
      env: {
        ...process.env,
        NODE_ENV: isDev ? 'development' : 'production',
        PORT: 5000,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'recytrack',
        DB_USER: 'recytrack',
        DB_PASSWORD: 'recytrack2024'
      }
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });

    console.log('Backend démarré');
  } catch (error) {
    console.error('Erreur démarrage backend:', error);
  }
}

// Créer la fenêtre principale
function createWindow() {
  // Options de la fenêtre
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'icons/icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false
  });

  // Charger l'application
  mainWindow.loadURL(FRONTEND_URL);

  // Afficher quand prêt
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Vérifier les mises à jour
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });

  // Gérer la fermeture
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Ouvrir les liens externes dans le navigateur
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Créer le menu de l'application
function createMenu() {
  const template = [
    {
      label: 'RecyTrack',
      submenu: [
        {
          label: 'À propos',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'À propos de RecyTrack',
              message: 'RecyTrack v1.0.0',
              detail: 'Solution de gestion des déchets pour entreprises.\nConforme à la loi AGEC.\n\n© 2024 RecyTrack Team',
              buttons: ['OK'],
              icon: path.join(__dirname, 'icons/icon.png')
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Préférences',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-preferences');
          }
        },
        { type: 'separator' },
        {
          label: 'Quitter',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { label: 'Annuler', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Rétablir', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Couper', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copier', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Coller', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { label: 'Recharger', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Plein écran', accelerator: 'F11', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Zoom avant', accelerator: 'CmdOrCtrl+Plus', role: 'zoomin' },
        { label: 'Zoom arrière', accelerator: 'CmdOrCtrl+-', role: 'zoomout' },
        { label: 'Taille réelle', accelerator: 'CmdOrCtrl+0', role: 'resetzoom' }
      ]
    },
    {
      label: 'Outils',
      submenu: [
        {
          label: 'Exporter les données',
          click: () => {
            mainWindow.webContents.send('export-data');
          }
        },
        {
          label: 'Importer des données',
          click: () => {
            mainWindow.webContents.send('import-data');
          }
        },
        { type: 'separator' },
        {
          label: 'Sauvegarder la base',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Sauvegarder la base de données',
              defaultPath: `recytrack-backup-${new Date().toISOString().split('T')[0]}.sql`,
              filters: [{ name: 'SQL Files', extensions: ['sql'] }]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('backup-database', result.filePath);
            }
          }
        }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://docs.recytrack.com');
          }
        },
        {
          label: 'Support',
          click: () => {
            shell.openExternal('https://support.recytrack.com');
          }
        },
        {
          label: 'Signaler un problème',
          click: () => {
            shell.openExternal('https://github.com/recytrack/issues');
          }
        },
        { type: 'separator' },
        {
          label: 'Vérifier les mises à jour',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify();
          }
        },
        { type: 'separator' },
        {
          label: 'Outils de développement',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          },
          visible: isDev
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Créer l'icône de la barre système
function createTray() {
  tray = new Tray(path.join(__dirname, 'icons/icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Ouvrir RecyTrack',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Dashboard',
      click: () => {
        mainWindow.show();
        mainWindow.webContents.send('navigate', '/dashboard');
      }
    },
    {
      label: 'Nouvelle déclaration',
      click: () => {
        mainWindow.show();
        mainWindow.webContents.send('navigate', '/declarations/new');
      }
    },
    { type: 'separator' },
    {
      label: 'Quitter',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('RecyTrack - Gestion des déchets');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// Splash screen
function createSplashWindow() {
  const splash = new BrowserWindow({
    width: 500,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false
    }
  });

  splash.loadFile(path.join(__dirname, 'splash.html'));
  
  return splash;
}

// Gérer le démarrage de l'application
app.whenReady().then(async () => {
  // Afficher le splash screen
  const splash = createSplashWindow();
  
  // Démarrer les services
  await startPostgreSQL();
  await startBackend();

  // Attendre que le backend soit prêt
  setTimeout(() => {
    splash.close();
    createWindow();
    createMenu();
    createTray();
  }, 5000);
});

// Gérer la fermeture
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Nettoyer à la fermeture
app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (postgresProcess) {
    postgresProcess.kill();
  }
});

// Gérer les mises à jour automatiques
autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Mise à jour disponible',
    message: 'Une nouvelle version de RecyTrack est disponible. Elle sera téléchargée en arrière-plan.',
    buttons: ['OK']
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Mise à jour prête',
    message: 'La mise à jour a été téléchargée. L\'application va redémarrer pour l\'installer.',
    buttons: ['Redémarrer maintenant', 'Plus tard']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// Communication avec le renderer
ipcMain.handle('get-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('save-preference', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('get-preference', (event, key) => {
  return store.get(key);
});

// Statistiques
ipcMain.handle('get-stats', async () => {
  // Communiquer avec le backend pour obtenir les stats
  try {
    const response = await fetch('http://localhost:5000/api/stats/dashboard');
    return await response.json();
  } catch (error) {
    return { error: 'Impossible de récupérer les statistiques' };
  }
});