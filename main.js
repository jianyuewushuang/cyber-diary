const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const isDev = !app.isPackaged;
  let diaryDir;

  if (isDev) {
    diaryDir = path.join(__dirname, 'diary');
  } else {
    diaryDir = path.join(app.getPath('userData'), 'diary');
    const packagedDiary = path.join(process.resourcesPath, 'diary');

    if (!fs.existsSync(diaryDir) && fs.existsSync(packagedDiary)) {
      fs.cpSync(packagedDiary, diaryDir, { recursive: true, force: false });
    }
  }

  require('./index.js').build(diaryDir);

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: '赛博日记本',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'build', 'index.html'));

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
