# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`vue3-charts` is a published npm library: an SVG charting library for Vue 3 built on d3 primitives (`d3-scale`, `d3-shape`, `d3-axis`, `d3-hierarchy`) and ramda. Vue is a peer dependency. User-facing docs live in a separate repo at https://vue3charts.org/, not here.

## Commands

```bash
npm ci                   # install from package-lock.json (what CI does)
npm run serve            # dev playground (vue-cli) at dev/serve.ts, routes / and /single
npm run check            # everything CI runs, in CI's order: lint, format:check, typecheck, build
npm run lint             # eslint via vue-cli-service (standard + vue/essential + prettier)
npm run format           # prettier --write .   (format:check is the CI variant)
npm run typecheck        # tsc --noEmit
npm run build            # rollup -> dist/vue3-charts.js (cjs), dist/vue3-charts.esm.js, dist/*.d.ts
```

There is no test suite. Verify changes visually in the playground: `dev/pages/Main.vue` exercises nearly every component and prop (grouped/stacked bars, line, area, pie, treemap, markers, tooltip, axis formatting, direction toggle).

`npm run lib` is a legacy vue-cli library build; `npm run build` (rollup) is the real one.

Run `npm run format` before committing; CI fails on unformatted files. ESLint handles correctness only (`eslint-config-prettier` turns off its formatting rules), Prettier owns formatting.

## CI and publishing (important)

`.github/workflows/ci.yml` runs on every pull request and every push to `main`: `lint` (eslint + prettier check), `typecheck` and `build` as separate jobs. On a push to `main` only, a `publish` job that `needs` all three builds again and runs `npm publish` when `package.json` `version` differs from what is on npm, so a release is "bump `version`, push to main". Do not bump the version unless a release is intended.

Publishing uses npm trusted publishing (GitHub OIDC, `id-token: write`), not a token secret. If publish fails with `E404 ... PUT https://registry.npmjs.org/vue3-charts`, the trusted publisher on npmjs.com (package Settings, Trusted Publisher: GitHub Actions, repo `ghalex/vue3-charts`, workflow `ci.yml`) is missing or misconfigured. The old `NPM_TOKEN` secret is a revoked classic token and is unused.

`package-lock.json` is committed and CI installs with `npm ci`, so a dependency change must be made with `npm install <pkg>` locally and the updated lockfile committed alongside `package.json`.

## Architecture

### Entry and exports

`src/index.ts` exports a Vue plugin (`app.use(...)` registers every component globally under its export name from `src/components/index.ts`) and also re-exports all components and hooks as named exports. A component that is not listed in `src/components/index.ts` is not part of the public API (`Labels` is an unfinished stub and is intentionally not exported).

### The Chart model and the `updates` counter

`<Chart>` (`src/components/Chart/index.vue`) creates one `Chart` instance (`src/models/Chart.ts`) and `provide`s it as `'chart'`, plus a reactive mouse object as `'chartMouse'`. Children get them via `useChart()` / `useMouse()`.

The `Chart` model is **not** reactive. It holds data, config, registered layers and the `Scales`. Every mutation (`changeData`, `changeConfig`, `addLayer`, `removeLayer`) calls `update()`, which recomputes scale ranges and domains and then increments `chart.updates` (a `Ref<number>`). Every component and hook that draws something does `watch(chart.updates, ...)` and re-reads from the model. This counter is the single re-render trigger for the whole chart; if something does not redraw, it is almost always because it does not watch `updates` or because the change never called `update()`.

### Layers register themselves

Each series component (`Bar`, `Line`, `Area`, `Pie`) wraps its SVG in `<Layer type dataKeys>`. `Layer` calls `chart.addLayer(...)` on mount and `removeLayer` on unmount. The model needs this registry because:

- scale domains are computed from the `dataKeys` of all registered layers (`getKeys`)
- `useBars` sizes and offsets each bar by counting registered layers of the same `type`
- stacked series are built with `d3-shape` `stack()` over the keys of layers whose `props.stacked` is true (`getStackedKeys`)

`<Group stacked maxWidth>` does not draw anything; it `provide`s `layerProps`, which `Layer`, `Bar`, `Area` and `Line` `inject`. That is how stacking/grouping is expressed in templates.

### Primary / secondary scales, not x / y

`Scales` holds `primary` (default `band`) and `secondary` (default `linear`). `direction` decides which screen axis each maps to: `'horizontal'` puts primary on x, `'vertical'` puts primary on y, `'circular'` is used by `Pie` and ignores axes. All geometry hooks (`usePoints`, `useBars`) branch on `chart.config.direction`, so any new drawing code must handle both orientations.

Numeric `domain` entries are strings evaluated with `eval` with `dataMin` / `dataMax` in scope (e.g. `['dataMin', 'dataMax + 100']`). This is a deliberate public API feature.

### Canvas and axis space

`chart.canvas` is the drawable rect: margins plus `axisSpace` (room reserved for the axes). `Chart` measures the rendered axis `<g>` elements with a `ResizeObserver` and feeds their size back into `axisSpace`, which triggers another `changeConfig` → `update()`. `Axis` renders by calling `d3-axis` on a `d3-selection` of its `<g>`, i.e. it mutates the DOM outside Vue's render.

### Slots: `layers` vs `widgets`

`<Chart>` has two slots. `#layers` is rendered inside the `<svg>` (series, `Grid`, `Marker`, `HoverBar`, raw `<defs>`). `#widgets` is a plain `<div>` positioned over the SVG, for HTML overlays such as `Tooltip`. Putting an SVG component in `widgets` or an HTML one in `layers` will not render.

### Hover and tooltip

`Chart` listens to `pointermove` on the SVG and sets `mouse.index` (band scale: arithmetic on bandwidth; linear scale: `bisectCenter` on the inverted scale). `useTooltip`, `HoverBar`, `Line` dots and `Bar` all read `mouse.index` to highlight the active datum. `Pie` sets `mouse` manually from its own `mousemove` handlers. `config.controlHover === false` disables the chart-level handling.

### Style props convention

Styling props (`barStyle`, `lineStyle`, `dotStyle`, `areaStyle`, `pieStyle`, `rcStyle`) are camelCase objects or functions returning objects. They are spread onto SVG elements after `mapKeys(kebabize, ...)` from `src/utils`, so `strokeWidth` becomes `stroke-width`. Function forms receive the datum props plus `active` (and `index` for line dots), which is how per-bar / per-point styling works.

### Treemap is standalone

`Treemap` renders its own `<svg>` and uses `d3-hierarchy` directly. It does not use the `Chart` model, `Layer`, scales or the mouse system.

## Conventions

- `@/` resolves to `src/` everywhere (tsconfig `paths`, rollup alias, vue-cli). The rollup build runs `tsc-alias` afterwards so emitted `.d.ts` files do not contain `@/` imports; keep that step if touching `rollup.config.js`.
- `rollup-plugin-typescript2` is given an explicit `include` in `rollup.config.js` because its default `**/*.ts+(|x)` extglob no longer matches under picomatch 4; without it no `.ts` file is transpiled and the build fails with "Unexpected token" on `src/index.ts`.
- Rollup stays on major 2: `rollup-plugin-vue` (the only maintained-enough SFC plugin for plain rollup) does not support rollup 3/4. Moving to rollup 4 means moving to Vite.
- Component `name`s must not collide with SVG/HTML element names (`vue/no-reserved-component-names`): the marker is `ChartMarker`, not `Marker`.
- Components use `defineComponent` with the Options-style `setup()`; no `<script setup>`.
- `dev/` is excluded from `tsconfig` and from the published package. Mock datasets for the playground live in `src/mockup/index.ts`.
