<template>
  <svg class="chart" :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" ref="el">
    <slot />
  </svg>
</template>

<script lang="ts">
import { computed, defineComponent, provide, ref, watch } from 'vue'
import { Layer, Margin } from '@/types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'
import { select } from 'd3-selection'

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
  setup(props) {
    const el = ref(null)
    const data = computed(() => props.data)
    const xScale = ref(scaleBand())
    const yScale = ref(scaleLinear())
    const layers = ref<Layer[]>([])
    const allValues = ref([] as number[])
    const hasXAxis = computed(() => {
      return select(el.value).selectChild('.axis-x').size() > 0
    })
    const hasYAxis = computed(() => {
      return select(el.value).selectChild('.axis-y').size() > 0
    })
    const canvas = computed(() => {
      const res = {
        x: props.margin.left + (hasYAxis.value ? 20 : 0),
        y: props.margin.top,
        width: props.width - props.margin.right,
        height: props.height - props.margin.bottom - (hasXAxis.value ? 20 : 0)
      }

      return res
    })
    const plane = computed(() => {
      return {
        data: data.value,
        canvas: canvas.value
      }
    })

    provide('plane', plane)
    provide('layers', layers)
    provide('xScale', xScale)
    provide('yScale', yScale)

    function updateRange() {
      xScale.value = xScale.value.copy().range([canvas.value.x, canvas.value.width])
      yScale.value = yScale.value.copy().rangeRound([canvas.value.height, canvas.value.y])
    }

    function updateDomain() {
      const xDomain = data.value.map((_, i) => i.toString())
      const yDomain = extent(allValues.value)

      xScale.value = xScale.value.copy().domain(xDomain)

      if (yDomain[0] !== undefined && yDomain[1] !== undefined) {
        yScale.value = yScale.value.copy().domain(yDomain)
      }
    }

    watch(
      canvas,
      () => {
        updateRange()
      },
      { immediate: true }
    )

    watch(layers, () => {
      let values: number[] = []

      for (const layer of layers.value) {
        const layerData = data.value.map((d) => d[layer.dataKey])
        values = values.concat(layerData)
      }

      allValues.value = Array.from(new Set(values))
      updateDomain()
    })

    return { el }
  }
})
</script>

<style>
svg {
  border: 1px solid red;
}
</style>
