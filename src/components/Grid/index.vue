<template>
  <g
    v-if="data.length"
    class="layer-grid"
    stroke="black"
    stroke-opacity="0.15"
    stroke-width="1"
    :stroke-dasharray="strokeDasharray"
  >
    <g class="grid-x" v-if="!hideX">
      <line v-for="(y, i) in xLines" :key="i" :x1="canvas.x" :y1="y" :x2="canvas.width" :y2="y" />
    </g>
    <g class="grid-y" v-if="!hideY">
      <line v-for="(x, i) in yLines" :key="i" :x1="x" :y1="canvas.y" :x2="x" :y2="canvas.height" />
    </g>
    <g>
      <line :x1="canvas.x" :y1="canvas.y" :x2="canvas.width" :y2="canvas.y" />
      <line :x1="canvas.width - 1" :y1="canvas.y" :x2="canvas.width - 1" :y2="canvas.height" />
    </g>
  </g>
</template>

<script lang="ts">
import { useChart } from '@/hooks'
import { Canvas, Data } from '@/types'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'Grid',
  props: {
    strokeDasharray: {
      type: String,
      default: () => '3 3'
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
    const data = ref<Data[]>([])
    const canvas = ref<Canvas | null>(null)
    const xLines = ref<number[]>([])
    const yLines = ref<number[]>([])

    function updateXLines() {
      const { primary, secondary } = chart.scales
      const current = chart.config.direction === 'horizontal' ? secondary : primary

      if (current.type === 'band' && !props.center) {
        const vals = current.map(chart.getData(chart.getKeys(0))).map((x) => x + current.bandwidth() / 2)
        vals.pop()
        xLines.value = vals
      } else {
        const ticks = current.ticks()
        xLines.value = current.map(ticks)
      }
    }

    function updateYLines() {
      const { primary, secondary } = chart.scales
      const current = chart.config.direction === 'horizontal' ? primary : secondary

      if (current.type === 'band' && !props.center) {
        const vals = current.map(chart.getData(chart.getKeys(0))).map((x) => x + current.bandwidth() / 2)
        vals.pop()
        yLines.value = vals
      } else {
        const ticks = current.ticks()
        yLines.value = current.map(ticks)
      }
    }

    watch(chart.updates, () => {
      data.value = chart.data
      canvas.value = chart.canvas

      updateXLines()
      updateYLines()
    })

    return { data, canvas, xLines, yLines }
  }
})
</script>
