import { describe, expect, it } from 'vitest'
import { Chart } from '@/models'
import { ChartLayer, Data } from '@/types'

const data: Data[] = [
  { name: 'Jan', avg: 0, pl: 10 },
  { name: 'Feb', avg: 20, pl: 5 },
  { name: 'Mar', avg: 30, pl: 40 }
]

const layer = (id: string, dataKeys: [string, string], props: Record<string, unknown> = {}): ChartLayer => ({
  id,
  type: 'bar',
  dataKeys,
  props
})

const makeChart = (config = {}) => {
  const chart = new Chart(data, { size: { width: 500, height: 400 }, axisSpace: { x: 40, y: 20 }, ...config })
  chart.addLayer(layer('a', ['name', 'avg']))
  return chart
}

describe('Chart canvas', () => {
  it('reserves axis space on the left and bottom', () => {
    const chart = makeChart({ margin: { top: 5, right: 10, bottom: 15, left: 20 } })
    expect(chart.canvas).toEqual({ x: 60, y: 5, width: 430, height: 360 })
  })

  it('drops bottom axis space when the primary axis is hidden on a horizontal chart', () => {
    const chart = makeChart({ axis: { primary: { hide: true } } })
    expect(chart.canvas.height).toBe(400)
    expect(chart.canvas.x).toBe(40)
  })

  it('drops left axis space when the primary axis is hidden on a vertical chart', () => {
    const chart = makeChart({ direction: 'vertical', axis: { primary: { hide: true } } })
    expect(chart.canvas.x).toBe(0)
    expect(chart.canvas.height).toBe(380)
  })

  it('does not mutate the config when reading the canvas', () => {
    const chart = makeChart({ axis: { primary: { hide: true }, secondary: { hide: true } } })
    void chart.canvas
    expect(chart.config.axisSpace).toEqual({ x: 40, y: 20 })
  })
})

describe('Chart layers and updates', () => {
  it('increments the updates counter on every mutation', () => {
    const chart = makeChart()
    const before = chart.updates.value
    chart.changeData([...data])
    chart.changeConfig({ direction: 'vertical' })
    chart.addLayer(layer('b', ['name', 'pl']))
    chart.removeLayer('b')
    expect(chart.updates.value).toBe(before + 4)
  })

  it('removes only the layer with the given id', () => {
    const chart = makeChart()
    chart.addLayer(layer('b', ['name', 'pl']))
    chart.removeLayer('a')
    expect(chart.getLayers('bar').map((l) => l.id)).toEqual(['b'])
  })

  it('collects keys per axis and stacked keys only from stacked layers', () => {
    const chart = makeChart()
    chart.addLayer(layer('b', ['name', 'pl'], { stacked: true }))
    expect(chart.getKeys(0)).toEqual(['name', 'name'])
    expect(chart.getKeys(1)).toEqual(['avg', 'pl'])
    expect(chart.getStackedKeys(1, 'bar')).toEqual(['pl'])
  })
})

describe('Chart scales', () => {
  it('maps the band domain from the primary key and keeps a zero value in the data', () => {
    const chart = makeChart()
    expect(chart.scales.primary.domain()).toEqual(['Jan', 'Feb', 'Mar'])
    expect(chart.getData(['avg'])).toEqual([0, 20, 30])
  })

  it('evaluates numeric domain expressions with dataMin and dataMax', () => {
    const chart = makeChart({ axis: { secondary: { domain: ['dataMin - 10', 'dataMax + 100'] } } })
    expect(chart.scales.secondary.domain()).toEqual([-10, 130])
  })

  it('puts the band scale on y for vertical charts', () => {
    const chart = makeChart({ direction: 'vertical' })
    const [start, end] = chart.scales.primary.range()
    expect(start).toBe(chart.canvas.y)
    expect(end).toBe(chart.canvas.y + chart.canvas.height)
    expect(chart.bandScale).toBe(chart.scales.primary)
  })

  it('accepts numbers and functions as domain bounds', () => {
    const chart = makeChart({ axis: { secondary: { domain: [0, ({ dataMax }: { dataMax: number }) => dataMax * 2] } } })
    expect(chart.scales.secondary.domain()).toEqual([0, 60])
  })

  it('positions and inverts values through the typed scale API', () => {
    const chart = makeChart({ margin: { top: 0, right: 0, bottom: 0, left: 0 } })
    const { primary, secondary } = chart.scales
    expect(primary.at('Jan')).toBe(chart.canvas.x)
    expect(primary.mapOne('Jan')).toBe(chart.canvas.x + primary.bandwidth() / 2)
    expect(primary.at('Nope')).toBeNaN()
    expect(primary.invert(100)).toBeNaN()
    expect(secondary.invert(secondary.at(20))).toBeCloseTo(20)
  })

  it('merges partial config over defaults without touching unrelated keys', () => {
    const chart = makeChart({ axis: { secondary: { ticks: 7 } }, margin: undefined })
    expect(chart.config.axis.secondary.type).toBe('linear')
    expect(chart.config.axis.secondary.ticks).toBe(7)
    expect(chart.config.margin).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
    chart.changeConfig({ axis: { primary: { tickValues: ['Jan'] } } })
    expect(chart.config.axis.primary.tickValues).toEqual(['Jan'])
    expect(chart.config.axis.secondary.ticks).toBe(7)
  })

  it('keeps user tick config', () => {
    const chart = makeChart({ axis: { secondary: { ticks: 3, tickValues: [0, 15, 30] } } })
    expect(chart.scales.secondary.ticks()).toEqual([0, 15, 30])
  })
})
