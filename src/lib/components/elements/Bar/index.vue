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
      :fill="getFill(bar.props)"
      :stroke-width="strokeWidth"
      :stroke="stroke"
    />
  </Layer>
</template>

<script>
import { computed, defineComponent } from 'vue'
import { useRectangles } from '@/lib/hooks'
import { is } from 'ramda'
import Layer from '../Layer/index.vue'

export default defineComponent({
  name: 'Bar',
  components: { Layer },
  props: {
    fill: {
      type: [String, Function],
      default: 'blue'
    },
    stroke: {
      type: String,
      default: null
    },
    strokeWidth: {
      type: Number,
      default: 0
    },
    maxWidth: {
      type: Number,
      default: 100
    },
    dataKey: {
      type: String,
      default: 'value'
    }
  },
  setup(props) {
    const { rectangles } = useRectangles(props.dataKey, { maxWidth: props.maxWidth })
    const getFill = computed(() => {
      if (is(Function, props.fill)) {
        return props.fill
      }

      return () => props.fill
    })

    return { getFill, rectangles }
  }
})
</script>
