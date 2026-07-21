# AGENTS.md

## Project

Node.js + Electron 桌面应用，无 TypeScript、无 bundler、无测试、无 lint、无 CI。

## Commands

| Command | Effect |
|---|---|
| `npm run build` | `node index.js` — 读取 `diary/*.md`，渲染为 HTML，写入 `build/index.html`，复制 `resources/` |
| `npm run dev` | `npm run build && electron .` — 构建后启动 Electron 并打开 DevTools |
| `npm run dist` | `electron-builder --mac --win --linux` — 打包为 dmg / exe / AppImage |
| `node index.js --dir <path>` | 自定义日记目录（CLI 模式） |

## Data flow

```
diary/*.md  →  index.js (markdown-it render + stats)  →  build/index.html
resources/   →  从 diary/ 同级复制                     →  build/resources/
```

`template.html` 中的 `{{DIARIES_DATA}}` / `{{STATS_DATA}}` 构建时替换。

## Electron architecture

- 主进程：`main.js`
- 渲染进程：`build/index.html`（`loadFile`，无 IPC / preload）
- 菜单：文件 → 选择日记文件夹... / 重新构建
- 开发环境：`diary/` 为数据目录
- 生产环境：`app.getPath('userData')` 下运行，结构如下：
  - `diary/` — 日记文件
  - `resources/` — 与 diary 同级的静态资源（每次构建覆盖）
  - `build/` — 构建输出（`index.html` + `resources/`）
  - `libs/` — Chart.js 等本地库
  - `config.json` — 存储 `lastDiaryDir`，实现文件夹记忆

## Packaging

- `asar: true`，`asarUnpack: diary/**/*` — 日记文件不打包进 asar，其余源码打包
- `extraResources: [{ from: 'diary', to: 'diary' }]` — 包含初始日记模板
- `resources/**/*`、`libs/**/*` 打包进 asar

## Constraints

- `build/index.html` 与 `build/resources/` 是 **git-tracked** 产物，修改 `template.html` / JS 后必须运行 `npm run build` 再提交
- `diary/*.md` 内容不得删除或修改（除非明确要求）
- `resources/` 与 `diary/` 必须同级；构建时从 `diaryDir/../resources/` 复制到构建输出
- `template.html` 中 Chart.js 必须保持本地路径 `../libs/chart.min.js`，不得改回 CDN
- 不要添加框架、bundler 或 transpiler（除非明确要求）

## Code patterns

- `index.js` 导出 `build(diaryDir, options)`，主进程通过 `require('./index.js').build(...)` 调用
- `main.js` 的 `rebuild()` 是生产环境构建调度入口：调用 `index.js.build()` → `win.loadFile()`
- 生产环境首次启动从 `process.resourcesPath` 复制 `diary/` 到 `userData/diary/`；`libs/` 和 `resources/` 同样从 asar 复制到 `userData/`
- `copyDir` 使用 `fs.readdirSync(src)` + `fs.statSync().isDirectory()`，兼容 asar 内目录读取
