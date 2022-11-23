<template>
  <g class="layer-hover-bar" v-if="mouse.hover">
    <rect
      class="hover-bar"
      v-bind="barStyle"
      :x="bar.x"
      :y="bar.y"
      :width="bar.width > 0 ? bar.width : 0"
      :height="bar.height > 0 ? bar.height : 0"
    />
  </g>
</template>

<script lang="ts">
import { useChart, useMouse } from '@/hooks'
import { Canvas } from '@/types'
import { ref, defineComponent, watch } from 'vue'

export default defineComponent({
  name: 'HoverBar',
  props: {
    barStyle: {
      type: Object,
      default: () => ({ 'fill-opacity': 0.05 })
    }
  },
  setup() {
    const chart = useChart()
    const mouse = useMouse()

    const bar = ref({ x: 0, y: 0, width: 0, height: 0 })
    const direction = ref('horizontal')
    const canvas = ref<Canvas>({ x: 0, y: 0, width: 0, height: 0 })

    watch(
      chart.updates,
      () => {
        canvas.value = chart.canvas
        direction.value = chart.config.direction
      },
      { immediate: true }
    )

    watch(mouse, () => {
      if (chart.bandScale) {
        const vals = chart.getData(chart.getKeys(0)) as number[]
        const [x] = chart.bandScale.map([vals[mouse.index]])
        const width = chart.bandScale.bandwidth()

        if (x) {
          if (chart.config.direction === 'horizontal') {
            bar.value = {
              x: x - width / 2,
              y: 0,
              width,
              height: canvas.value.height
            }
          } else {
            bar.value = {
              x: 40,
              y: x - width / 2,
              width: canvas.value.width - 40,
              height: width
            }
          }
        }
      }
    })
    return { bar, canvas, direction, mouse }
  }
})
</script>
