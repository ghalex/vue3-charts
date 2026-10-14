import { describe, expect, it } from 'vitest'
import { evaluateDomain } from '@/utils'

const bounds = { dataMin: -10, dataMax: 250 }

describe('evaluateDomain', () => {
  it('returns numbers and calls functions', () => {
    expect(evaluateDomain(5, bounds)).toBe(5)
    expect(evaluateDomain(({ dataMax }) => dataMax + 1, bounds)).toBe(251)
  })

  it.each([
    ['dataMin', -10],
    ['dataMax', 250],
    ['0', 0],
    ['dataMax + 100', 350],
    ['dataMin - 10', -20],
    ['dataMax * 1.1', 275],
    ['dataMax / 2', 125],
    ['-dataMin', 10],
    ['(dataMax - dataMin) * 2 + 1', 521],
    ['2 + 3 * 4', 14],
    ['min(0, dataMin)', -10],
    ['max(0, dataMin)', 0],
    ['ceil(dataMax / 100) * 100', 300],
    ['1e2', 100]
  ])('evaluates %s', (expression, expected) => {
    expect(evaluateDomain(expression, bounds)).toBe(expected)
  })

  it('rejects anything that is not arithmetic over the bounds', () => {
    expect(() => evaluateDomain('window.location', bounds)).toThrow(SyntaxError)
    expect(() => evaluateDomain('dataMax; alert(1)', bounds)).toThrow(SyntaxError)
    expect(() => evaluateDomain('foo', bounds)).toThrow(/Unknown identifier/)
    expect(() => evaluateDomain('(dataMax', bounds)).toThrow(SyntaxError)
    expect(() => evaluateDomain('dataMax +', bounds)).toThrow(SyntaxError)
  })
})
