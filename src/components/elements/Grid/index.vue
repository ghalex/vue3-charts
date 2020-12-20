<template>
  <g
    v-if="data.length"
    class="layer-grid"
    stroke="black"
    stroke-opacity="0.15"
    stroke-width="1"
    :stroke-dasharray="strokeDasharray"
  >
    <g class="grid-x">
      <line v-for="(y, i) in xLines" :key="i" :x1="canvas.x" :y1="y" :x2="canvas.width" :y2="y" />
      <!-- <line :x1="canvas.x" :y1="canvas.y" :x2="canvas.width" :y2="canvas.y" /> -->
    </g>
    <g class="grid-y">
      <line v-for="(x, i) in yLines" :key="i" :x1="x" :y1="canvas.y" :x2="x" :y2="canvas.height" />
      <line :x1="canvas.width - 1" :y1="canvas.y" :x2="canvas.width - 1" :y2="canvas.height" />
    </g>
  </g>
</template>

<script>
import { computed, defineComponent } from 'vue'
import { usePlane, useScales } from '@/hooks'
import { nth } from 'ramda'

export default defineComponent({
  name: 'Grid',
  props: {
    strokeDasharray: {
      type: String,
      default: () => '3 3'
    }
  },
  setup() {
    const { data, canvas } = usePlane()
    const { xScale, yScale } = useScales()

    const xLines = computed(() => {
      const ticks = yScale.value.ticks(Math.round(canvas.value.height / 60))
      const res = ticks.map((v) => yScale.value(v))

      if (nth(-1, res) > canvas.value.y) {
        res.push(canvas.value.y)
      }

      return res
    })

    const yLines = computed(() => {
      return data.value.map((d, i) => (xScale.value(i.toString()) || 0) + xScale.value.bandwidth() / 2)
    })

    return { data, canvas, xLines, yLines }
  }
})
</script>

<style></style>
