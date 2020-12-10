<template>
  <div class="chart">
    <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" ref="el">
      <slot />
    </svg>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, provide, ref, watch } from 'vue'
import { Layer, Margin } from '@/types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'

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

    provide('data', data)
    provide('canvas', canvas)
    provide('layers', layers)
    provide('layersData', layersData)
    provide('xScale', xScale)
    provide('yScale', yScale)

    function updateRange() {
      xScale.value = xScale.value.copy().range([canvas.value.x, canvas.value.width])
      yScale.value = yScale.value.copy().rangeRound([canvas.value.height, canvas.value.y])
    }

    function updateDomain() {
      const xDomain = data.value.map((_: any, i: number) => i.toString())
      const yDomain = extent(layersData.value)

      xScale.value = xScale.value.copy().domain(xDomain)

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

    watch(props, () => {
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
    })

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

    return { el }
  }
})
</script>

<style scoped>
.chart {
  display: flex;
  padding: 4px;
}
</style>
