import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { Bar, Chart, Group, Line, Pie } from '@/components'
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
