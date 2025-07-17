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
let mongoProcess;

// Configuration des chemins
const FRONTEND_URL = isDev 
  ? 'http://localhost:3000' 
  : `file://${path.join(__dirname, 'build/index.html')}`;

const BACKEND_PATH = isDev
  ? path.join(__dirname, '../../backend')
  : path.join(process.resourcesPath, 'backend');

// Fonction pour démarrer MongoDB embarqué
async function startMongoDB() {
  if (isDev) return; // En dev, MongoDB est externe

  try {
    const mongoPath = path.join(process.resourcesPath, 'mongodb/bin/mongod');
    const dbPath = path.join(app.getPath('userData'), 'database');
    
    // Créer le dossier de données s'il n'existe pas
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    mongoProcess = spawn(mongoPath, [
      '--dbpath', dbPath,
      '--port', '27017',
      '--logpath', path.join(app.getPath('userData'), 'mongodb.log')
    ]);

    console.log('MongoDB démarré');
  } catch (error) {
    console.error('Erreur démarrage MongoDB:', error);
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
        MONGODB_URI: 'mongodb://localhost:27017/recytrack'
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
              detail: 'Solution de gestion des déchets pour entreprises.\n\n© 2024 RecyTrack Team',
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Préférences',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // Ouvrir les préférences
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
  tray = new Tray(path.join(__dirname, 'icons/tray.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Ouvrir RecyTrack',
      click: () => {
        mainWindow.show();
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

  tray.setToolTip('RecyTrack');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// Gérer le démarrage de l'application
app.whenReady().then(async () => {
  // Démarrer les services
  await startMongoDB();
  await startBackend();

  // Attendre que le backend soit prêt
  setTimeout(() => {
    createWindow();
    createMenu();
    createTray();
  }, 3000);
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
  if (mongoProcess) {
    mongoProcess.kill();
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