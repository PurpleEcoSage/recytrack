const { contextBridge, ipcRenderer } = require('electron');

// Exposer des APIs sécurisées au renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Informations système
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // Préférences
  savePreference: (key, value) => ipcRenderer.invoke('save-preference', key, value),
  getPreference: (key) => ipcRenderer.invoke('get-preference', key),
  
  // Événements
  onOpenPreferences: (callback) => {
    ipcRenderer.on('open-preferences', callback);
  },
  
  // Notifications natives
  showNotification: (title, body) => {
    new Notification(title, { body });
  }
});