import * as r from 'ramda'

export const kebabCase = r.pipe(r.toLower, r.split(' '), r.join('-'))
export const getCol = r.curry((col: string | number, df: any[]): any[] => {
  if (r.is(Number)) {
    return r.map((v) => r.nth(col as number, v) || '', df).filter((x) => x !== '')
  }

  return r.map(r.prop(col as string), df)
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
