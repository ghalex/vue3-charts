import * as r from 'ramda'

export const kebabCase = r.pipe(r.toLower, r.split(' '), r.join('-'))

const isPresent = (x: unknown) => x !== undefined && x !== null

/**
 * Column projection: `getCol('key', rows)` or `getCol(index, tuples)`.
 * Rows that do not have the column are skipped; `0`, `''` and `false` are kept.
 */
export const getCol = r.curry((col: string | number, df: any[]): any[] => {
  return df.map((row) => (row == null ? undefined : row[col])).filter(isPresent)
})

export const mapKeys = (fn: (val: string) => string, data: { [key: string]: any }) =>
  r.zipObj(r.map(fn, r.keys(data) as string[]), r.values(data))

export const kebabize = (str: string) => {
  return str
    .split('')
    .map((letter, idx) => {
      return letter.toUpperCase() === letter ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}` : letter
    })
    .join('')
}
