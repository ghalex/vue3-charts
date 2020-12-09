<template>
  <g class="layer-bar">
    <rect
      v-for="(bar, i) in rectangles"
      :key="i"
      :x="bar.x"
      :y="bar.y"
      :width="bar.width"
      :height="bar.height"
      :fill="fill"
    />
  </g>
</template>

<script>
import { defineComponent } from 'vue'
import { useDataLayer } from '@/hooks'

export default defineComponent({
  name: 'Bar',
  props: {
    fill: {
      type: String,
      default: 'blue'
    },
    dataKey: {
      type: String,
      default: 'value'
    }
  },
  setup(props) {
    const { rectangles } = useDataLayer({ type: 'bar', dataKey: props.dataKey })

    return { rectangles }
  }
})
</script>

<style></style>
