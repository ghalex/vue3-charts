<template>
  <g class="layer-hover-bar" v-if="mouse.hover">
    <rect
      class="hover-bar"
      v-bind="toSvgAttrs(barStyle)"
      :x="bar.x"
      :y="bar.y"
      :width="Math.max(bar.width, 0)"
      :height="Math.max(bar.height, 0)"
    />
  </g>
</template>

<script lang="ts">
import { useChart, useMouse } from '@/hooks'
import { StyleObject } from '@/types'
import { toSvgAttrs } from '@/utils'
import { defineComponent, PropType, ref, watch } from 'vue'

export default defineComponent({
  name: 'HoverBar',
  props: {
    barStyle: {
      type: Object as PropType<StyleObject>,
      default: () => ({ fillOpacity: 0.05 })
    }
  },
  setup() {
    const chart = useChart()
    const mouse = useMouse()
    const bar = ref({ x: 0, y: 0, width: 0, height: 0 })

    watch(mouse, () => {
      const band = chart.bandScale
      if (!band) return

      const vals = chart.getData(chart.getKeys(0))
      const value = vals[mouse.index]
      if (value === undefined) return

      const center = band.mapOne(value)
      const width = band.bandwidth()
      const { canvas } = chart

      if (isNaN(center)) return

      if (chart.config.direction === 'horizontal') {
        bar.value = { x: center - width / 2, y: canvas.y, width, height: canvas.height }
      } else {
        bar.value = { x: canvas.x, y: center - width / 2, width: canvas.width, height: width }
      }
    })

    return { bar, mouse, toSvgAttrs }
  }
})
</script>
