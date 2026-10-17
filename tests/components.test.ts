import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { Bar, Chart, Group, Line, Marker, Pie } from '@/components'
import { useChart } from '@/hooks'
import type { Chart as ChartModel } from '@/models'

const data = [
  { name: 'Jan', avg: 0, pl: 10 },
  { name: 'Feb', avg: 20, pl: 5 },
  { name: 'Mar', avg: 30, pl: 40 }
]

// Renders nothing; lets a test reach the Chart model provided to the layers.
const ChartProbe = defineComponent({
  name: 'ChartProbe',
  setup() {
    const chart = useChart()
    return { chart }
  },
  render: () => h('g')
})

const findChart = (wrapper: ReturnType<typeof mount>) =>
  (wrapper.findComponent(ChartProbe).vm as unknown as { chart: ChartModel }).chart

describe('Group', () => {
  it('does not insert a non-SVG element around its layers', async () => {
    const wrapper = mount(Chart, {
      props: { data, size: { width: 400, height: 300 } },
      slots: {
        layers: () =>
          h(Group, { maxWidth: 50 }, () => [
            h(Bar, { dataKeys: ['name', 'avg'] }),
            h(Bar, { dataKeys: ['name', 'pl'] })
          ])
      }
    })
    await nextTick()

    expect(wrapper.find('svg div').exists()).toBe(false)
    expect(wrapper.findAll('rect.chart-bar').length).toBe(6)
    expect(wrapper.find('rect.chart-bar').element.parentElement?.tagName).toBe('g')
  })

  it('shares stacking props with its layers', async () => {
    const wrapper = mount(Chart, {
      props: { data, size: { width: 400, height: 300 } },
      slots: {
        layers: () => [
          h(ChartProbe),
          h(Group, { stacked: true }, () => [
            h(Bar, { dataKeys: ['name', 'avg'] }),
            h(Bar, { dataKeys: ['name', 'pl'] })
          ])
        ]
      }
    })
    await nextTick()

    expect(findChart(wrapper).getStackedKeys(1, 'bar')).toEqual(['avg', 'pl'])
  })
})

describe('Layer registration', () => {
  it('gives sibling layers distinct ids so unmounting one keeps the others', async () => {
    const Host = defineComponent({
      props: { showLine: { type: Boolean, default: true } },
      render() {
        return h(
          Chart,
          { data, size: { width: 400, height: 300 } },
          {
            layers: () => [
              h(ChartProbe),
              h(Bar, { dataKeys: ['name', 'avg'] }),
              this.showLine ? h(Line, { dataKeys: ['name', 'pl'] }) : null
            ]
          }
        )
      }
    })
    const wrapper = mount(Host)
    await nextTick()
    const chart = findChart(wrapper)
    expect(chart.layers.map((l) => l.type)).toEqual(['bar', 'line'])
    expect(new Set(chart.layers.map((l) => l.id)).size).toBe(2)

    await wrapper.setProps({ showLine: false })
    expect(chart.layers.map((l) => l.type)).toEqual(['bar'])
  })
})

describe('Bar', () => {
  it('draws a zero-height bar for a zero value instead of dropping it', async () => {
    const wrapper = mount(Chart, {
      props: { data, size: { width: 400, height: 300 } },
      slots: { layers: () => h(Bar, { dataKeys: ['name', 'avg'] }) }
    })
    await nextTick()
    const heights = wrapper.findAll('rect.chart-bar').map((r) => Number(r.attributes('height')))
    expect(heights).toHaveLength(3)
    expect(heights[0]).toBe(0)
    expect(heights[2]).toBeGreaterThan(heights[1])
  })

  it('emits barClick with the bar index', async () => {
    const wrapper = mount(Chart, {
      props: { data, size: { width: 400, height: 300 } },
      slots: { layers: () => h(Bar, { dataKeys: ['name', 'avg'] }) }
    })
    await nextTick()
    await wrapper.findAll('rect.chart-bar')[1].trigger('click')
    const emitted = wrapper.findComponent(Bar).emitted('barClick')
    expect(emitted).toHaveLength(1)
    expect((emitted![0][0] as { idx: number }).idx).toBe(1)
  })
})

describe('Pie', () => {
  it('applies pieStyle to the arcs and reacts to prop changes', async () => {
    const Host = defineComponent({
      props: { innerRadius: { type: Number, default: 50 } },
      render() {
        return h(
          Chart,
          {
            data,
            direction: 'circular',
            size: { width: 300, height: 300 },
            axis: { primary: { hide: true }, secondary: { hide: true } }
          },
          {
            layers: () =>
              h(Pie, { dataKeys: ['name', 'pl'], pieStyle: { innerRadius: this.innerRadius, strokeWidth: 3 } })
          }
        )
      }
    })
    const wrapper = mount(Host)
    await nextTick()
    const paths = wrapper.findAll('path.chart-pie')
    expect(paths).toHaveLength(3)
    expect(paths[0].attributes('stroke-width')).toBe('3')
    const before = paths[0].attributes('d')

    await wrapper.setProps({ innerRadius: 0 })
    expect(wrapper.find('path.chart-pie').attributes('d')).not.toBe(before)
  })
})

describe('Chart axis measurement', () => {
  it('applies the measured axis size on the next frame, not inside the ResizeObserver callback', async () => {
    let callback: ResizeObserverCallback | undefined
    const frames: FrameRequestCallback[] = []

    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: ResizeObserverCallback) {
          callback = cb
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    )
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
    vi.stubGlobal('cancelAnimationFrame', () => {})

    try {
      const wrapper = mount(Chart, {
        props: { data, size: { width: 400, height: 300 } },
        slots: { layers: () => h(ChartProbe) }
      })
      await nextTick()
      const chart = findChart(wrapper)
      const leftAxis = wrapper.find('g.axis > g:last-child').element
      const before = chart.canvas.x

      expect(callback).toBeDefined()
      callback!(
        [{ target: leftAxis, contentRect: { width: 77, height: 0 } } as unknown as ResizeObserverEntry],
        {} as ResizeObserver
      )
      await nextTick()

      // Re-rendering the observed axis from inside the callback is what triggers "ResizeObserver loop limit exceeded".
      expect(chart.canvas.x).toBe(before)
      expect(frames).toHaveLength(1)

      frames[0](0)
      await nextTick()
      expect(chart.canvas.x).toBe(77)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('Marker', () => {
  const mountMarker = (
    markerProps: InstanceType<typeof Marker>['$props'],
    direction: 'horizontal' | 'vertical' = 'horizontal'
  ) => {
    const wrapper = mount(Chart, {
      props: { data, direction, size: { width: 400, height: 300 } },
      slots: {
        layers: () => [h(ChartProbe), h(Bar, { dataKeys: ['name', 'pl'] }), h(Marker, markerProps)]
      }
    })
    return wrapper
  }

  const lineAttrs = (wrapper: ReturnType<typeof mount>) => {
    const line = wrapper.find('g.layer-marker line')
    return ['x1', 'y1', 'x2', 'y2'].map((attr) => Number(line.attributes(attr)))
  }

  it('marks a value on the secondary axis by default', async () => {
    const wrapper = mountMarker({ value: 20 })
    await nextTick()

    const [x1, y1, x2, y2] = lineAttrs(wrapper)
    const { canvas, scales } = findChart(wrapper)
    expect(y1).toBe(y2)
    expect(y1).toBe(scales.secondary.at(20))
    expect([x1, x2]).toEqual([canvas.x, canvas.x + canvas.width])
  })

  it('marks a category on the primary axis with a line across the chart (#60)', async () => {
    const wrapper = mountMarker({ value: 'Feb', axis: 'primary' })
    await nextTick()

    const [x1, y1, x2, y2] = lineAttrs(wrapper)
    const { canvas, scales } = findChart(wrapper)
    expect(x1).toBe(x2)
    expect(x1).toBe(scales.primary.mapOne('Feb'))
    expect([y1, y2]).toEqual([canvas.y, canvas.y + canvas.height])
  })

  it('draws a primary-axis marker horizontally on a vertical chart', async () => {
    const wrapper = mountMarker({ value: 'Feb', axis: 'primary' }, 'vertical')
    await nextTick()

    const [x1, y1, x2, y2] = lineAttrs(wrapper)
    const { canvas, scales } = findChart(wrapper)
    expect(y1).toBe(y2)
    expect(y1).toBe(scales.primary.mapOne('Feb'))
    expect([x1, x2]).toEqual([canvas.x, canvas.x + canvas.width])
  })
})
