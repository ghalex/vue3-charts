<template>
  <g class="layer-marker">
    <text :x="canvas.x + 5" :y="y - 5" text-anchor="start" :fill="color">{{ label }}</text>
    <line
      :x1="canvas.x"
      :y1="y"
      :x2="canvas.width"
      :y2="y"
      :stroke="color"
      stroke-opacity="0.5"
      :stroke-width="1"
      :stroke-dasharray="strokeDasharray"
    />
  </g>
</template>

<script>
import { computed, defineComponent } from 'vue'
import { usePlane, useScales } from '@/hooks'

export default defineComponent({
  name: 'Grid',
  props: {
    value: {
      type: Number
    },
    label: {
      type: String,
      default: 'label'
    },
    color: {
      type: String,
      default: 'red'
    },
    strokeDasharray: {
      type: String,
      default: () => '3'
    }
  },
  setup(props) {
    const { data, canvas } = usePlane()
    const { yScale } = useScales()
    const y = computed(() => {
      const res = yScale.value(props.value)
      console.log(props.value, res)
      return res
    })

    return { data, y, canvas }
  }
})
</script>
