# Changelog

All notable changes to **GuanXue (观穴) 3D Oriental Acupoint Atlas** are documented in this file.

## [2.0.0] - 2026-11-13

### Architecture & Engineering Standards
- Restructured the repository from a flat `/docs` bundle into a standard modular codebase (`src/data`, `src/scene`, `src/styles`, `src/vendor`, `scripts`, `tests`, `assets`, `licenses`).
- Moved `index.html` and `.nojekyll` to repository root so GitHub Pages deploys cleanly from `/ (root)`.
- Added root `MIT LICENSE`, `package.json` (`type: "module"`), `.editorconfig`, `.gitignore`, `CONTRIBUTING.md`, `.github/ISSUE_TEMPLATE/`, and GitHub Actions CI (`npm run check` & `npm test`).
- Added zero-dependency Node static dev server (`scripts/dev-server.mjs`), link/import integrity checker (`scripts/check-integrity.mjs`), and `node:test` test suite (`tests/atlas.test.mjs`).

### 3D Rendering & UI/UX Upgrade
- Upgraded WebGL rendering with equirectangular studio reflection dome and custom GLSL sculptural shaders (`jade`, `bronze`, `xray`, `ivory`).
- Added dynamic 12-branch **Ziwu Liuzhu (子午流注)** celestial compass pedestal synced with current system time and active meridian shortcut (`#shichenBtn`).
- Added surface-normal glowing golden light needle (`needleGroup`) and breathing dual reticle for the active acupoint.
- Upgraded meridian conduits to surface-hugging `CatmullRomCurve3` tubes and fixed world-space scaling artifacts.
- Upgraded 149 traditional symptom associations in `src/scene/effects.js` with animated gold-to-cyan GLSL Qi wave shaders, target halos, and non-overlapping SVG elbow leader callouts (`#leaderLines`).
- Redesigned UI around deep obsidian ink / celadon jade / imperial gold editorial theme with 4x4 meridian filter matrix, special-point seal badges, meridian progression bar, and keyboard navigation (`/`, `←`, `→`, `Escape`).
