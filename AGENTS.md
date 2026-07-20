# AGENTS.md

## Project

Single-package Node.js 14+ static site generator (CommonJS `require`). No TypeScript, no transpiler, no tests, no lint, no CI.

## Commands

| Command | Effect |
|---|---|
| `npm run build` | `node index.js` — reads `diary/*.md`, injects JSON into `template.html`, writes `build/index.html` |
| `npm run dev` | build + `npx http-server build -p 8080` |

No other scripts, Makefiles, or task runners.

## Data flow

```
diary/*.md  →  index.js (markdown-it render + stats)  →  build/index.html
```

`build/index.html` is **git-tracked**, not gitignored. Regenerating it is part of every build.

## Source of truth

- Diary entries: `diary/*.md` — filename must be `yyyyMMdd.md` or `yyMMdd.md`
- HTML template: `template.html` (1931 lines, self-contained CSS+JS+Chart.js CDN)
- Static assets: `resources/` → copied to `build/resources/` during build

`index.js` replaces `{{DIARIES_DATA}}` and `{{STATS_DATA}}` placeholders in `template.html`.

## Themes

Two themes toggled by `body` class: cyberpunk purple (`:root` default) and 21th minimalist (`body.theme-21th`). Alternate templates in `extra/template-purple/` and `extra/template-21th/` are experimental, not wired in.

## Constraints

- Do not add frameworks, bundlers, or transpilers without explicit request
- Do not delete or modify `diary/*.md` content
- `build/` output is committed — run `npm run build` before committing template/JS changes
