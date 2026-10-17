<template>
  <g class="layer-marker" v-if="horizontal">
    <text :x="canvas.x + 5" :y="position - 5" text-anchor="start" :fill="color">{{ label }}</text>
    <line
      :x1="canvas.x"
      :y1="position"
      :x2="canvas.x + canvas.width"
      :y2="position"
      :stroke="color"
      :stroke-opacity="strokeOpacity"
      :stroke-width="strokeWidth"
      :stroke-dasharray="strokeDasharray"
    />
  </g>
  <g class="layer-marker" v-else>
    <text :x="position + 10" :y="canvas.y + 5" text-anchor="start" :fill="color" style="writing-mode: tb">{{
      label
    }}</text>
    <line
      :x1="position"
      :y1="canvas.y"
      :x2="position"
      :y2="canvas.y + canvas.height"
      :stroke="color"
      :stroke-opacity="strokeOpacity"
      :stroke-width="strokeWidth"
      :stroke-dasharray="strokeDasharray"
    />
  </g>
</template>

<script lang="ts">
import { useChart } from '@/hooks'
import { Canvas } from '@/types'
import { ref, defineComponent, watch, PropType } from 'vue'

export default defineComponent({
  name: 'ChartMarker',
  props: {
    value: {
      type: [Number, String] as PropType<number | string>,
      required: true
    },
    /** Which scale `value` belongs to. The line is drawn across the chart, perpendicular to that axis. */
    axis: {
      type: String as PropType<'primary' | 'secondary'>,
      default: 'secondary'
    },
    label: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'red'
    },
    strokeDasharray: {
      type: String,
      default: '3'
    },
    strokeWidth: {
      type: Number,
      default: 1
    },
    strokeOpacity: {
      type: Number,
      default: 0.5
    }
  },
  setup(props) {
    const chart = useChart()
    const position = ref(0)
    // true when the marker is a horizontal line (the marked axis runs vertically on screen)
    const horizontal = ref(true)
    const canvas = ref<Canvas>(chart.canvas)

    function update() {
      const scale = props.axis === 'primary' ? chart.scales.primary : chart.scales.secondary
      position.value = scale.mapOne(props.value)
      canvas.value = chart.canvas
      horizontal.value = (props.axis === 'secondary') === (chart.config.direction === 'horizontal')
    }

    watch(chart.updates, update, { immediate: true })
    watch(() => [props.value, props.axis], update)

    return { position, canvas, horizontal }
  }
})
</script>
