import type { StyleObject, StyleProp } from '@/types'

export * from './domain'

const isPresent = (x: unknown) => x !== undefined && x !== null

/**
 * Column projection: `getCol('key', rows)` or `getCol(index, tuples)`.
 * Rows that do not have the column are skipped; `0`, `''` and `false` are kept.
 */
export function getCol<T = any>(col: string | number, df: readonly any[]): T[] {
  return df.map((row) => (row == null ? undefined : row[col])).filter(isPresent) as T[]
}

export const mapKeys = (fn: (val: string) => string, data: StyleObject): StyleObject =>
  Object.fromEntries(Object.entries(data).map(([key, value]) => [fn(key), value]))

export const kebabize = (str: string) => {
  return str
    .split('')
    .map((letter, idx) => {
      return letter.toUpperCase() === letter ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}` : letter
    })
    .join('')
}

/** `strokeWidth` -> `stroke-width`, ready to `v-bind` onto an SVG element. */
export const toSvgAttrs = (style: StyleObject) => mapKeys(kebabize, style)

/** Style props are either an object or a function of the datum; normalise to an object. */
export function resolveStyle<A>(style: StyleProp<A> | undefined, args: A, defaults: StyleObject = {}): StyleObject {
  const custom = typeof style === 'function' ? style(args) : style
  return { ...defaults, ...custom }
}

const isPlainObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && Object.getPrototypeOf(x) === Object.prototype

/**
 * Deep merge for config objects: `overrides` win, `undefined` overrides are ignored and arrays
 * (domains, tick values) are replaced, not merged.
 */
export function mergeConfig<T extends Record<string, any>>(base: T, overrides: Record<string, any> | undefined): T {
  if (!overrides) return base
  const result: Record<string, any> = { ...base }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue
    result[key] = isPlainObject(value) && isPlainObject(result[key]) ? mergeConfig(result[key], value) : value
  }
  return result as T
}
