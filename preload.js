const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  rebuild: () => ipcRenderer.invoke('rebuild')
});
