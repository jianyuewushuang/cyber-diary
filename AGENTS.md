# AGENTS.md

Node.js + Electron 桌面应用 (CommonJS, no TS, no bundler, no test/lint/CI).

## Commands

| Command | Effect |
|---|---|
| `npm run build` | `node index.js` — reads `diary/*.md`, renders HTML, writes `build/index.html`, copies `resources/` |
| `npm run dev` | `npm run build && electron .` — build then launch Electron with DevTools |
| `npm run dist` | `electron-builder --mac --win --linux` — package to dmg/exe/AppImage |
| `node index.js --dir <path>` | CLI mode with custom diary directory |

`postinstall` runs `prepare.js` (copies chart.js from `node_modules` to `libs/chart.min.js`).

## Data flow

```
diary/*.md → index.js (markdown-it render + stats) → build/index.html
resources/  → from diary's parent dir                → build/resources/
```

`template.html` placeholders `{{DIARIES_DATA}}` / `{{STATS_DATA}}` replaced at build time.

## Architecture

- **Main process**: `main.js` — menus, file dialog, `index.js.build()` → `win.loadFile()`.
- **Renderer**: `build/index.html` (`loadFile`, no IPC/preload).
- **Dev**: `diary/` at repo root is data dir.
- **Production** (`app.getPath('userData')`): `build/`, `libs/`, `config.json` (stores `lastDiaryDir`). `diary/` and `resources/` are read directly from the user-selected folder on every rebuild.
- **First launch (packaged)**: copies `libs/` from asar to `userData/libs/` (Chart.js). No diary/resources are copied.
- `copyDir` uses `fs.readdirSync` + `fs.statSync().isDirectory()` — works inside asar.

## Packaging

- `asar: true`, `asarUnpack: diary/**/*`
- `extraResources: [{ from: 'diary', to: 'diary' }]`
- `resources/**/*`, `libs/**/*` inside asar; `diary/` unpacked.

## Constraints

- `build/` is gitignored — run `npm run build` before commits that change template/JS.
- `diary/*.md` content must not be deleted or modified unless explicitly asked.
- `resources/` must always be a sibling of the diary directory; copied from `diaryDir/../resources/`.
- Chart.js path in `template.html` must stay local (`../libs/chart.min.js`), never CDN.
- No frameworks, bundlers, or transpilers unless explicitly required.
- `resources/` and `libs/chart.min.js` are git-tracked; `build/` and `dist/` are not.

## Filename convention

`diary/*.md` files must be named `yyyyMMdd.md` (e.g. `20260606.md`) or `yyMMdd.md` (e.g. `260606.md`, auto-prefixed with `20`).
