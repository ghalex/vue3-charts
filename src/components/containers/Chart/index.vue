<template>
  <div class="chart" :style="{ display: 'flex', position: 'relative' }">
    <svg
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      ref="el"
      @mousemove="onMouseMove"
      @mouseout="onMouseOut"
    >
      <slot />
    </svg>
    <slot name="widgets" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, provide, ref, watch } from 'vue'
import { Layer, Margin } from '@/types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'
import { pointer } from 'd3-selection'

export default defineComponent({
  name: 'Chart',
  props: {
    width: { type: Number, default: 600 },
    height: { type: Number, default: 300 },
    margin: {
      type: Object as () => Margin,
      default: { top: 0, right: 0, bottom: 0, left: 0 }
    },
    data: {
      type: Array as () => any[],
      default: []
    }
  },
  setup(props, { slots }) {
    const el = ref(null)
    const data = ref(props.data)
    const layers = ref([] as Array<Layer>)
    const layersData = ref([] as Array<number>)
    const xScale = ref(scaleBand())
    const yScale = ref(scaleLinear())
    const mousePos = ref({ x: 0, y: 0 })
    const mouseIdx = ref({ x: 0, y: 0 })
    const isMouseOver = ref(false)
    const domain = ref(['dataMin', 'dataMax'])

    const xAxis = computed(() => {
      if (slots.default) {
        const slot = slots.default().find((s: any) => s.type.name === 'XAxis')

        if (slot) {
          return {
            name: 'xaxis',
            dataKey: slot.props?.dataKey
          }
        }
      }

      return undefined
    })
    const yAxis = computed(() => {
      if (slots.default) {
        const slot = slots.default().find((s: any) => s.type.name === 'YAxis')
        if (slot) {
          return {
            name: 'yaxis'
          }
        }
      }

      return undefined
    })

    const canvas = ref({
      x: props.margin.left,
      y: props.margin.top + 10,
      width: props.width - props.margin.right,
      height: props.height - props.margin.bottom
    })

    provide('chart', el)
    provide('data', data)
    provide('domain', domain)
    provide('canvas', canvas)
    provide('layers', layers)
    provide('layersData', layersData)
    provide('xScale', xScale)
    provide('yScale', yScale)
    provide('mousePos', mousePos)
    provide('mouseIdx', mouseIdx)
    provide('isMouseOver', isMouseOver)

    function updateRange() {
      xScale.value = xScale.value.copy().range([canvas.value.x, canvas.value.width])
      yScale.value = yScale.value.copy().range([canvas.value.height, canvas.value.y])
    }

    function updateDomain() {
      const xDomain = data.value.map((_: any, i: number) => i.toString())
      xScale.value = xScale.value.copy().domain(xDomain)

      const [dataMin, dataMax] = extent(layersData.value)
      const yMin = eval(`
        let dataMin = ${dataMin || 0}
        ${domain.value[0]}
      `)

      const yMax = eval(`
        let dataMax = ${dataMax || 0}
        ${domain.value[1]}
      `)

      const yDomain = [yMin, yMax]

      if (yDomain && yDomain[0] !== undefined && yDomain[1] !== undefined) {
        yScale.value = yScale.value.copy().domain(yDomain)
      }
    }

    function updateLayerData() {
      let values: number[] = []

      for (const layer of layers.value) {
        const layerData = data.value.map((d: any) => d[layer.dataKey])
        values = values.concat(layerData)
      }

      layersData.value = Array.from(new Set(values))
    }

    function onMouseOut() {
      mouseIdx.value = { x: -1, y: 0 }
      isMouseOver.value = false
    }

    function onMouseMove(e: any) {
      mousePos.value = { x: pointer(e)[0], y: pointer(e)[1] }

      const band = xScale.value.bandwidth()
      const x = mousePos.value.x - canvas.value.x

      mouseIdx.value = {
        x: Math.round((x + band / 2) / band) - 1,
        y: pointer(e)[1]
      }

      isMouseOver.value = true
    }

    watch(
      props,
      () => {
        data.value = props.data
        canvas.value = {
          x: props.margin.left + (yAxis.value ? 40 : 0),
          y: props.margin.top + 10,
          width: props.width - props.margin.right,
          height: props.height - props.margin.bottom - (xAxis.value ? 20 : 0)
        }

        updateLayerData()
        updateDomain()
        updateRange()
      },
      { immediate: true }
    )

    watch(
      canvas,
      () => {
        updateRange()
      },
      { immediate: true }
    )

    watch(layers, () => {
      updateLayerData()
      updateDomain()
    })

    watch(domain, () => {
      updateDomain()
    })

    return { el, onMouseMove, onMouseOut }
  }
})
</script>
