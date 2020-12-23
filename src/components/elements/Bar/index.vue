<template>
  <Layer type="bar" :dataKey="dataKey" :color="fill">
    <text v-if="rectangles.length === 0">No Data</text>
    <rect
      v-for="(bar, i) in rectangles"
      :key="i"
      :x="bar.x"
      :y="bar.y"
      :width="bar.width > 0 ? bar.width : 0"
      :height="bar.height > 0 ? bar.height : 0"
      :fill="fill"
    />
  </Layer>
</template>

<script>
import { defineComponent } from 'vue'
import { useRectangles } from '@/hooks'
import Layer from '../Layer/index.vue'

export default defineComponent({
  name: 'Bar',
  components: { Layer },
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
    const { rectangles } = useRectangles(props.dataKey)
    return { rectangles }
  }
})
</script>
