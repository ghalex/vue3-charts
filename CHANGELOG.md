# Changelog

## Unreleased (2.0.0)

### Breaking

- `chart.canvas.width` / `chart.canvas.height` are now sizes of the drawable area instead of the right / bottom
  edges. Custom layers that used `canvas.width` as an x coordinate must use `canvas.x + canvas.width`.
- `Scale.scale` is typed as `ScaleBand | ScaleLinear`. Use the `Scale` methods (`at`, `mapOne`, `map`, `invert`,
  `domain`, `range`, `ticks`, `bandwidth`) or the `band` / `linear` getters instead of calling `scale.scale(...)`.
- Numeric axis `domain` strings are parsed by a small arithmetic evaluator instead of `eval`. `'dataMin'`,
  `'dataMax + 100'`, `'min(0, dataMin)'` keep working; arbitrary JavaScript does not. Numbers and functions
  (`({ dataMin, dataMax }) => number`) are accepted too.
- `ramda` is no longer a dependency.
- `Pie` is centred in the canvas instead of being top-left aligned when the canvas is not square.
- `Chart` `axis.primary.hide` / `secondary.hide` now hide the axis the scale is drawn on; on a vertical chart the
  primary axis is the left one. Previously `primary.hide` always hid the bottom axis.
- `Marker` requires `value`.
- The package ships only `dist` (no `src`) and declares an `exports` map, so deep imports such as
  `vue3-charts/src/...` no longer resolve.

### Fixed

- `Group` rendered a `<div>` inside the `<svg>`, which browsers do not render, so grouped and stacked series were
  invisible.
- Values of `0` (and `''` / `false`) were dropped from scale domains, hover lookup and pies.
- Layers created in the same millisecond shared an id, so unmounting one series removed all of them.
- `pieStyle` was never applied; `sort` / `sortFunc` / `pieStyle` changes did not re-render.
- `axis.*.ticks` was always overwritten with 5.
- `HoverBar` and `Tooltip` assumed a 40px left axis.
- `Line`/`Area`/`Pie` style props accept functions without a Vue prop warning; `Bar` declares `barClick`.

### Changed

- Build and playground moved from vue-cli + rollup 2 to Vite; typecheck uses `vue-tsc`; ESLint 9 flat config;
  `vitest` test suite under `tests/`.
- Runtime dependencies (`d3-*`) are external to the bundle instead of inlined (ESM bundle 246KB -> 40KB).
