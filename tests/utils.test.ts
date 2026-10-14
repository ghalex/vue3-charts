import { describe, expect, it } from 'vitest'
import { getCol, kebabize, mapKeys } from '@/utils'

describe('getCol', () => {
  it('projects a column by key and keeps falsy values', () => {
    const rows = [{ v: 0 }, { v: 5 }, { v: '' }, { v: false }]
    expect(getCol('v', rows)).toEqual([0, 5, '', false])
  })

  it('skips rows where the column is missing', () => {
    const rows = [{ v: 1 }, {}, { v: null }, { v: 3 }]
    expect(getCol('v', rows)).toEqual([1, 3])
  })

  it('projects a column by index from tuples', () => {
    const tuples: [string, string][] = [
      ['name', 'avg'],
      ['name', 'pl']
    ]
    expect(getCol(1, tuples)).toEqual(['avg', 'pl'])
  })
})

describe('kebabize / mapKeys', () => {
  it('turns camelCase style keys into SVG attribute names', () => {
    expect(mapKeys(kebabize, { strokeWidth: 2, fillOpacity: 0.5, fill: 'red' })).toEqual({
      'stroke-width': 2,
      'fill-opacity': 0.5,
      fill: 'red'
    })
  })
})
