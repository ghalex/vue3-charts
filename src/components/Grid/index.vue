<template>
  <g
    v-if="hasData"
    class="layer-grid"
    stroke="black"
    stroke-opacity="0.15"
    stroke-width="1"
    :stroke-dasharray="strokeDasharray"
  >
    <g class="grid-x" v-if="!hideX">
      <line v-for="(y, i) in xLines" :key="i" :x1="canvas.x" :y1="y" :x2="canvas.x + canvas.width" :y2="y" />
    </g>
    <g class="grid-y" v-if="!hideY">
      <line v-for="(x, i) in yLines" :key="i" :x1="x" :y1="canvas.y" :x2="x" :y2="canvas.y + canvas.height" />
    </g>
    <g>
      <line :x1="canvas.x" :y1="canvas.y" :x2="canvas.x + canvas.width" :y2="canvas.y" />
      <line
        :x1="canvas.x + canvas.width - 1"
        :y1="canvas.y"
        :x2="canvas.x + canvas.width - 1"
        :y2="canvas.y + canvas.height"
      />
    </g>
  </g>
</template>

<script lang="ts">
import { useChart } from '@/hooks'
import { Canvas } from '@/types'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'Grid',
  props: {
    strokeDasharray: {
      type: String,
      default: '3 3'
    },
    hideX: {
      type: Boolean,
      default: false
    },
    hideY: {
      type: Boolean,
      default: false
    },
    center: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const chart = useChart()
    const hasData = ref(false)
    const canvas = ref<Canvas>(chart.canvas)
    const xLines = ref<number[]>([])
    const yLines = ref<number[]>([])

    // Lines across the secondary axis (horizontal lines on a horizontal chart) and across the primary one.
    function linesFor(scale: typeof chart.scales.primary) {
      if (scale.type === 'band' && !props.center) {
        const edges = scale.map(chart.getData(chart.getKeys(0))).map((x) => x + scale.bandwidth() / 2)
        edges.pop()
        return edges
      }
      return scale.map(scale.ticks())
    }

    watch(chart.updates, () => {
      const { primary, secondary } = chart.scales
      const horizontal = chart.config.direction === 'horizontal'

      hasData.value = chart.data.length > 0
      canvas.value = chart.canvas
      xLines.value = linesFor(horizontal ? secondary : primary)
      yLines.value = linesFor(horizontal ? primary : secondary)
    })

    return { hasData, canvas, xLines, yLines }
  }
})
</script>
