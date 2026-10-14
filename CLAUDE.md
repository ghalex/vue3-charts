# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`vue3-charts` is a published npm library: an SVG charting library for Vue 3 built on d3 primitives (`d3-scale`, `d3-shape`, `d3-axis`, `d3-hierarchy`). No other runtime dependencies; keep it that way. Vue is a peer dependency. User-facing docs live in a separate repo at https://vue3charts.org/, not here.

## Commands

Development needs Node 22 or newer (jsdom 30 and vitest 5 refuse older versions; CI runs Node 24).

```bash
npm ci                   # install from package-lock.json (what CI does)
npm run dev              # Vite playground at index.html -> dev/serve.ts, routes / and /single
npm run check            # everything CI runs, in CI's order: lint, format:check, typecheck, test, build
npm run lint             # eslint (flat config in eslint.config.mjs: js + typescript-eslint + vue/essential + prettier)
npm run format           # prettier --write .   (format:check is the CI variant)
npm run typecheck        # vue-tsc --noEmit over src/, dev/ and tests/ (templates are type-checked too)
npm test                 # vitest run (tests/**/*.test.ts, jsdom); `npm run test:watch` for watch mode
npm run build            # vite build -> dist/vue3-charts.js (cjs), dist/vue3-charts.esm.js, dist/**/*.d.ts
```

Tests live in `tests/` and cover the `Chart`/`Scale` models, `utils`, and component regressions mounted with
`@vue/test-utils` (`tests/setup.ts` stubs `ResizeObserver`, which jsdom lacks). Add a test for every bug fix. Visual
checks still happen in the playground: `dev/pages/Main.vue` exercises nearly every component and prop (grouped/stacked
bars, line, area, pie, treemap, markers, tooltip, axis formatting, direction toggle).

Run `npm run format` before committing; CI fails on unformatted files. ESLint handles correctness only
(`eslint-config-prettier` turns off its formatting rules), Prettier owns formatting.

## CI and publishing (important)

`.github/workflows/ci.yml` runs on every pull request and every push to `main`: `lint` (eslint + prettier check), `typecheck`, `test` and `build` as separate jobs. On a push to `main` only, a `publish` job that `needs` all four builds again and runs `npm publish` when `package.json` `version` differs from what is on npm, so a release is "bump `version`, push to main". See **Versioning** below: the maintainer bumps, never the assistant.

Publishing uses npm trusted publishing (GitHub OIDC, `id-token: write`), not a token secret. If publish fails with `E404 ... PUT https://registry.npmjs.org/vue3-charts`, the trusted publisher on npmjs.com (package Settings, Trusted Publisher: GitHub Actions, repo `ghalex/vue3-charts`, workflow `ci.yml`) is missing or misconfigured. The old `NPM_TOKEN` secret is a revoked classic token and is unused.

`package-lock.json` is committed and CI installs with `npm ci`, so a dependency change must be made with `npm install <pkg>` locally and the updated lockfile committed alongside `package.json`.

### Versioning (important)

Pushing a changed `version` to `main` publishes to npm, and a publish cannot be undone. Rules:

- **Never change `version` on your own.** Only the maintainer decides when to release and which version it is. If a release seems appropriate, say so and stop; do not bump "while you are at it", and never treat a vague reply such as "ok" or "push" as approval of a version number. Ask for the exact version and wait for it.
- **Strict semantic versioning.** Patch (`x.y.Z`) for bug fixes with no API change. Minor (`x.Y.0`) for new, backwards-compatible features, including tooling and build changes that do not change behaviour for consumers. Major (`X.0.0`) is reserved for changes that break existing user code, and that call is the maintainer's; do not promote a release to major because a refactor _could_ affect someone.
- Bump with `npm version <patch|minor|major> --no-git-tag-version` so `package-lock.json` stays in sync, move the `Unreleased` section of `CHANGELOG.md` under the new version, and make that its own `chore: release x.y.z` commit.

## Architecture

### Entry and exports

`src/index.ts` exports a Vue plugin (`app.use(...)` registers every component globally under its export name from `src/components/index.ts`) and also re-exports all components and hooks as named exports. A component that is not listed in `src/components/index.ts` is not part of the public API.

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

`Scale` wraps the d3 scale in a typed API (`at`, `mapOne`, `map`, `invert`, `domain`, `range`, `ticks`, `bandwidth`, plus `band` / `linear` narrowing getters). Drawing code should go through it rather than `scale.scale`, so the union type does not leak.

Numeric `domain` entries are a number, a function `({ dataMin, dataMax }) => number`, or a string expression such as `'dataMax + 100'` or `'min(0, dataMin)'`. Strings are parsed by `src/utils/domain.ts` (arithmetic, parentheses, `dataMin`/`dataMax`, and `min`/`max`/`abs`/`round`/`floor`/`ceil`), never `eval`; anything else throws a `SyntaxError`.

### Canvas and axis space

`chart.canvas` is the drawable rect inside the margins and the `axisSpace` reserved for visible axes. `width` and `height` are real sizes (the right edge is `x + width`); before 2.0 they were edges, so old snippets that do `canvas.width - canvas.x` are wrong now. `Chart` measures the rendered axis `<g>` elements with a `ResizeObserver` and feeds their size back into `axisSpace`, which triggers another `changeConfig` → `update()`. `Axis` renders by calling `d3-axis` on a `d3-selection` of its `<g>`, i.e. it mutates the DOM outside Vue's render.

### Slots: `layers` vs `widgets`

`<Chart>` has two slots. `#layers` is rendered inside the `<svg>` (series, `Grid`, `Marker`, `HoverBar`, raw `<defs>`). `#widgets` is a plain `<div>` positioned over the SVG, for HTML overlays such as `Tooltip`. Putting an SVG component in `widgets` or an HTML one in `layers` will not render.

### Hover and tooltip

`Chart` listens to `pointermove` on the SVG and sets `mouse.index` (band scale: arithmetic on bandwidth; linear scale: `bisectCenter` on the inverted scale). `useTooltip`, `HoverBar`, `Line` dots and `Bar` all read `mouse.index` to highlight the active datum. `Pie` sets `mouse` manually from its own `mousemove` handlers. `config.controlHover === false` disables the chart-level handling.

### Style props convention

Styling props (`barStyle`, `lineStyle`, `dotStyle`, `areaStyle`, `pieStyle`, `rcStyle`, HoverBar `barStyle`) are typed `StyleProp`: a camelCase object or a function returning one. Components resolve them with `resolveStyle(prop, args, defaults)` and spread them with `toSvgAttrs` from `src/utils`, so `strokeWidth` becomes `stroke-width`. Function forms receive the datum props plus `active` (and `index` for line dots), which is how per-bar / per-point styling works.

### Treemap is standalone

`Treemap` renders its own `<svg>` and uses `d3-hierarchy` directly. It does not use the `Chart` model, `Layer`, scales or the mouse system.

## Conventions

- `@/` resolves to `src/` everywhere (tsconfig `paths`, `resolve.alias` in `vite.config.mts`). `vite-plugin-dts` rewrites it to relative paths in the emitted `.d.ts` files.
- The build is Vite library mode (`vite.config.mts`): `es` + `cjs` outputs, every entry of `dependencies` and `peerDependencies` is external, component CSS is injected at runtime by `vite-plugin-css-injected-by-js` (consumers never import a stylesheet), `public/` is not copied (playground assets only). The config is `.mts` because the package is CommonJS (`dist/vue3-charts.js` must stay `.js`), so do not add `"type": "module"` to `package.json`.
- `package.json` has an `exports` map and `sideEffects: false`; only `dist` is published.
- Component `name`s must not collide with SVG/HTML element names (`vue/no-reserved-component-names`): the marker is `ChartMarker`, not `Marker`.
- Components use `defineComponent` with the Options-style `setup()`; no `<script setup>`. `Group` is renderless (returns the slot) because any non-SVG element inside `<svg>` is created in the SVG namespace and nothing inside it renders.
- `dev/` and `tests/` are type-checked but not published. Mock datasets for the playground live in `src/mockup/index.ts`.
