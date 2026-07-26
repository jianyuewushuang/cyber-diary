const { app, BrowserWindow, shell, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let diaryDir;
let buildDir;
let win;

function loadConfig() {
  try {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

function saveConfig(key, value) {
  const config = loadConfig();
  config[key] = value;
  const userData = app.getPath('userData');
  if (!fs.existsSync(userData)) {
    fs.mkdirSync(userData, { recursive: true });
  }
  const configPath = path.join(userData, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function copyDir(src, dest) {
  console.log('[copyDir] src:', src);
  console.log('[copyDir] dest:', dest);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src);
  console.log('[copyDir] entries:', entries.length, entries);
  for (const entry of entries) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function rebuild() {
  const isDev = !app.isPackaged;

  console.log('[rebuild] diaryDir:', diaryDir);
  console.log('[rebuild] isDev:', isDev);

  if (isDev) {
    if (!diaryDir) diaryDir = path.join(__dirname, 'diary');
    buildDir = path.join(__dirname, 'build');
    console.log('[rebuild] buildDir:', buildDir);
    require('./index.js').build(diaryDir, { buildDir: buildDir, isDev: true });
  } else {
    const userData = app.getPath('userData');
    buildDir = path.join(userData, 'build');
    const libsDir = path.join(userData, 'libs');

    if (!fs.existsSync(libsDir)) {
      copyDir(path.join(__dirname, 'libs'), libsDir);
    }

    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    require('./index.js').build(diaryDir, { buildDir: buildDir, isDev: false });
  }

  if (win) {
    console.log('[rebuild] 重新加载页面:', path.join(buildDir, 'index.html'));
    win.loadFile(path.join(buildDir, 'index.html'));
  }
}



async function createWindow() {
  const isDev = !app.isPackaged;

  const config = loadConfig();
  if (config.lastDiaryDir && fs.existsSync(config.lastDiaryDir)) {
    diaryDir = config.lastDiaryDir;
  } else {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: '选择日记文件夹'
    });
    if (!result.canceled && result.filePaths.length > 0) {
      diaryDir = result.filePaths[0];
    } else if (isDev) {
      diaryDir = path.join(__dirname, 'diary');
    } else {
      app.quit();
      return;
    }
    saveConfig('lastDiaryDir', diaryDir);
  }

  rebuild();

  win = new BrowserWindow({
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
          label: '选择日记文件夹...',
          click: () => {
            dialog.showOpenDialog(win, {
              properties: ['openDirectory']
            }).then(result => {
              if (!result.canceled && result.filePaths.length > 0) {
                diaryDir = result.filePaths[0];
                saveConfig('lastDiaryDir', diaryDir);
                rebuild();
              }
            }).catch(err => {
              console.error('选择文件夹失败:', err);
            });
          }
        },
        {
          label: '重新构建',
          click: () => {
            rebuild();
          }
        }
      ]
    }
  ];  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
