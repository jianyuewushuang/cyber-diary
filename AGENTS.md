# AGENTS.md

## Project

Node.js CommonJS 静态站点生成器，现同时作为 Electron 桌面应用运行。无 TypeScript、无 transpiler、无测试、无 lint、无 CI。

## Commands

| Command | Effect |
|---|---|
| `npm run build` | `node index.js` — 读取 `diary/*.md`，注入 JSON 到 `template.html`，写入 `build/index.html` |
| `npm run prepare` | 复制 Chart.js 到 `libs/`（`postinstall` 也会自动运行） |
| `npm run dev` | `npm run build && electron .` |
| `npm run dist` | `electron-builder --mac --win --linux` |
| `node index.js --dir <path>` | 自定义日记目录，CLI 兼容模式 |

## Data flow

```
diary/*.md  →  index.js (markdown-it render + stats)  →  build/index.html
template.html 中的 {{DIARIES_DATA}} / {{STATS_DATA}} 在构建时替换
```

`build/index.html` 与 `build/resources/` 是 **git-tracked** 产物，构建后需提交。

## Source of truth

- 日记文件：`diary/*.md`，文件名必须为 `yyyyMMdd.md` 或 `yyMMdd.md`
- HTML 模板：`template.html`（自包含 CSS+JS）
- Chart.js：本地 `libs/chart.min.js`，模板通过 `../libs/chart.min.js` 引用
- 静态资源：`resources/` → 构建时复制到 `build/resources/`

## Electron 架构

- 主进程：`main.js`
- 渲染进程加载：`build/index.html`（`loadFile`，无 IPC/preload）
- 开发环境：`diary/` 为数据目录
- 生产环境：首次启动从打包资源复制到 `app.getPath('userData')/diary`
- `index.js` 已导出 `build(diaryDir)` 供 `main.js` 调用，保留直接运行能力

## Packaging

- `package.json` `build` 字段配置：`asar: true`，`asarUnpack: diary/**/*`
- `extraResources: [{ from: 'diary', to: 'diary' }]`
- 打包产物：Mac/Windows/Linux

## Constraints

- 不要添加框架、bundler 或 transpiler（除非明确要求）
- 不要删除或修改 `diary/*.md` 内容
- `build/` 输出已提交 — 修改 `template.html` / JS 后运行 `npm run build` 再提交
- `template.html` 中 Chart.js 必须保持本地路径，不得改回 CDN
