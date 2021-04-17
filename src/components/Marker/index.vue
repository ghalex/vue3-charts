<template>
  <g class="layer-marker" v-if="direction === 'horizontal'">
    <text :x="canvas.x + 5" :y="y - 5" text-anchor="start" :fill="color">{{ label }}</text>
    <line
      :x1="canvas.x"
      :y1="y"
      :x2="canvas.width"
      :y2="y"
      :stroke="color"
      :stroke-opacity="strokeOpacity"
      :stroke-width="strokeWidth"
      :stroke-dasharray="strokeDasharray"
    />
  </g>
  <g class="layer-marker" v-else>
    <text :x="y + 10" :y="canvas.y + 5" text-anchor="start" :fill="color" style="writing-mode: tb;">{{ label }}</text>
    <line
      :x1="y"
      :y1="canvas.y"
      :x2="y"
      :y2="canvas.height"
      :stroke="color"
      :stroke-opacity="strokeOpacity"
      :stroke-width="strokeWidth"
      :stroke-dasharray="strokeDasharray"
    />
  </g>
</template>

<script lang="ts">
import { useChart } from '@/hooks'
import { ref, defineComponent, watch } from 'vue'

export default defineComponent({
  name: 'Grid',
  props: {
    value: {
      type: Number
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
      default: () => '3'
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
    const y = ref(0)
    const direction = ref('horizontal')
    const canvas = ref({})

    watch(
      chart.updates,
      () => {
        if (props.value !== undefined) {
          y.value = chart.scales.secondary.scale(props.value)
        }

        canvas.value = chart.canvas
        direction.value = chart.config.direction
      },
      { immediate: true }
    )

    watch(
      () => props.value,
      () => {
        y.value = chart.scales.secondary.scale(props.value)
      },
      { immediate: true }
    )
    return { y, canvas, direction }
  }
})
</script>
