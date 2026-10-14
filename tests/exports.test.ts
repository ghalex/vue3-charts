import { describe, expect, it } from 'vitest'
import type { AxisConfig, ChartAxis, ChartAxisOptions, ChartOptions, StyleProp } from '@/index'
import * as lib from '@/index'

// The types are erased at runtime; the typecheck step is what verifies they resolve from the package entry.
const axis: AxisConfig = { domain: [0, 'dataMax'], type: 'linear', ticks: 5 }
const both: ChartAxis = { primary: { domain: [0, 10], type: 'band' }, secondary: axis }
const options: ChartAxisOptions = { secondary: { hide: true } }
const config: ChartOptions = { direction: 'vertical', axis: options }
const style: StyleProp = ({ active }) => ({ fill: active ? 'red' : 'blue' })

describe('package entry', () => {
  it('exports every component and hook', () => {
    expect(lib.Chart).toBeDefined()
    expect(lib.Bar).toBeDefined()
    expect(lib.useChart).toBeTypeOf('function')
  })

  it('exports the types module', () => {
    expect(lib.PieSort).toBeDefined()
    expect(both.secondary).toBe(axis)
    expect(config.axis).toBe(options)
    expect(style).toBeTypeOf('function')
  })
})
