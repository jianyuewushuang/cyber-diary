# Electron 迁移计划

## 目标

将现有的 Node.js 静态站点生成器迁移为纯本地 Electron 桌面应用，Node 逻辑运行在主进程，前端运行在渲染进程，不依赖任何外部服务器。

## 已确认决策

- **数据交付**：主进程预渲染 HTML，渲染进程 `loadFile()` 加载本地 `build/index.html`。保留现有 `index.js` + `template.html` 职责边界，无需 IPC/preload。
- **日记目录**：打包后 `diary/` 放在 `app.getPath('userData')`，首次启动从包内资源复制。用户可直接编辑。
- **CLI 兼容**：保留 `node index.js` 入口，新增 CLI 参数指定日记目录。开发模式默认使用项目内 `diary/`。
- **构建产物**：`build/index.html` 保持 git-tracked，作为开发基准。生产环境在 `userData` 中动态生成独立副本。

## 目录结构

```
cyber-diary/
├── main.js                  # Electron 主进程入口（新建）
├── package.json             # 新增 electron、electron-builder 依赖
├── template.html            # Chart.js CDN 替换为本地路径
├── index.js                 # 新增 CLI 参数支持，日记目录可配置
├── diary/                   # 开发时使用，git-tracked
├── resources/               # 静态资源
├── build/
│   ├── index.html           # 开发时生成，git-tracked
│   └── resources/           # 复制自 resources/
├── libs/
│   └── chart.min.js         # Chart.js 本地副本
└── extra/                   # 保持
```

## 实施步骤

### 1. 初始化依赖
- `npm install --save-dev electron electron-builder`
- `package.json` 新增：
  - `main: "main.js"`
  - `scripts.dev`: `electron .`
  - `scripts.prepare`: 复制 Chart.js 到 `libs/`
  - `scripts.dist`: `electron-builder --mac --win --linux`

### 2. 修改 `index.js`
- 新增 `--dir <path>` CLI 参数支持（`process.argv` 解析）。
- 未传入时默认 `path.join(__dirname, 'diary')`。
- 导出 `build(diaryDir)` 函数供 `main.js` 调用，保留直接运行能力。

### 3. Chart.js 本地化
- `template.html` 中 `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>` 替换为 `<script src="../libs/chart.min.js"></script>`。
- `npm run prepare`：从 `node_modules/chart.js/dist/chart.umd.min.js` 复制到 `libs/chart.min.js`。
- `postinstall` 钩子自动执行 prepare，避免遗漏。

### 4. 创建 `main.js`
- `app.whenReady()` 中：
  1. 确定日记目录：开发环境用项目内 `diary/`，生产环境用 `app.getPath('userData')/diary`。
  2. 首次启动时，若 `userData/diary` 不存在，从 `path.join(process.resourcesPath, 'diary')` 复制。
  3. 调用 `require('./index.js').build(diaryDir)` 生成 HTML。
  4. 创建 `BrowserWindow`，`loadFile('build/index.html')`，标题“赛博日记本”，默认 1400×900，最小 800×600。
- 开发环境 `openDevTools()`，生产环境关闭。
- `contextIsolation: true`，`nodeIntegration: false`。

### 5. 打包配置（`package.json` build 字段）
- `appId`: `com.cyberdiary.app`
- `productName`: 赛博日记本
- `asar`: `true`
- `asarUnpack`: `diary/**/*`（开发模板数据，打包后可被 userData 覆盖）
- `extraResources`: `[{ from: 'diary', to: 'diary' }]`（打包时包含初始日记模板）
- `files`: 包含 `main.js`, `index.js`, `template.html`, `resources/**/*`, `libs/**/*`, `node_modules/**/*`

### 6. 构建流程
- `npm run build`：保持 `node index.js`，生成 `build/index.html` + 复制 `resources/`。
- `npm run prepare`：复制 Chart.js 到 `libs/`。
- `npm run dev`：`npm run build && electron .`
- `npm run dist`：`electron-builder` 打包。

### 7. 热重载（可选，v1 后置）
- 主进程 `fs.watch()` 监听 `diary/`（开发模式）或 `userData/diary`（生产模式）。
- 变更时重新构建并 `webContents.reload()`。

## 关键实现细节

- `index.js` 路径解析：
  - 开发：`path.join(__dirname, 'diary')`
  - 生产：`path.join(app.getPath('userData'), 'diary')`
  - CLI：`node index.js --dir /custom/path`
- `template.html` 中 Chart.js 路径 `../libs/chart.min.js` 相对于 `build/index.html` 解析，`build/` 与 `libs/` 同级。
- `userData` 首次启动复制逻辑：用 `fs.cpSync(src, dest, { recursive: true, force: false })`，仅当目标不存在时复制。

## 验证步骤

1. `npm install` 安装新依赖。
2. `npm run prepare` 确认 `libs/chart.min.js` 生成。
3. `npm run dev` 启动 Electron，窗口正常打开，日历、搜索、图表、主题切换均工作。
4. 断网测试：确认无 CDN 请求，Chart.js 从本地加载。
5. `npm run dist` 打包，安装运行，确认日记数据完整、可正常浏览。
6. 验证 `build/index.html` 仍 git-tracked 且内容正确。
7. 验证 `node index.js --dir /tmp/test-diary` CLI 模式仍正常工作。

## 风险

- **userData 路径**：首次复制仅在新安装时触发，更新版本时已有数据不会被覆盖。
- **Chart.js 路径**：`loadFile()` 加载时相对路径解析依赖文件系统位置，需确保 `build/` 与 `libs/` 始终同级。
- **asar 与 extraResources**：`extraResources` 中的 `diary/` 在安装后位于 `app.getPath('userData')` 之外，需通过 `process.resourcesPath` 访问。
