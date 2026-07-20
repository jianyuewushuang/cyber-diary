const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createWindow() {
  const isDev = !app.isPackaged;
  let diaryDir;
  let buildDir;

  if (isDev) {
    diaryDir = path.join(__dirname, 'diary');
    buildDir = path.join(__dirname, 'build');
    require('./index.js').build(diaryDir, { buildDir: buildDir, isDev: true });
  } else {
    const userData = app.getPath('userData');
    diaryDir = path.join(userData, 'diary');
    buildDir = path.join(userData, 'build');
    const resourcesDir = path.join(userData, 'resources');
    const libsDir = path.join(userData, 'libs');

    const packagedDiary = path.join(process.resourcesPath, 'diary');
    if (!fs.existsSync(diaryDir) && fs.existsSync(packagedDiary)) {
      fs.cpSync(packagedDiary, diaryDir, { recursive: true, force: false });
    }

    if (!fs.existsSync(resourcesDir)) {
      copyDir(path.join(__dirname, 'resources'), resourcesDir);
    }

    if (!fs.existsSync(libsDir)) {
      copyDir(path.join(__dirname, 'libs'), libsDir);
    }

    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    require('./index.js').build(diaryDir, { buildDir: buildDir, isDev: false });
  }

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

  win.loadFile(path.join(buildDir, 'index.html'));

  if (isDev) {
    win.webContents.openDevTools();
  }

  const menuTemplate = [
    {
      label: '文件',
      submenu: [
        {
          label: '打开日记文件夹',
          click: () => {
            shell.openPath(diaryDir);
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
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
