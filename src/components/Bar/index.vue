<template>
  <Layer :dataKeys="dataKeys" type="bar">
    <text v-if="bars.length === 0">No Data</text>
    <rect
      v-for="(bar, i) in bars"
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

<script lang="ts">
import { computed, defineComponent, inject } from 'vue'
import { useBars } from '@/hooks'
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
    dataKeys: {
      type: Object as () => [string, string],
      required: true
    }
  },
  setup(props) {
    const { stacked } = inject('layerProps', { stacked: false })
    const { bars } = useBars(props.dataKeys, { maxWidth: props.maxWidth, stacked, type: 'bar' })
    const getFill = computed(() => {
      if (is(Function, props.fill)) {
        return props.fill
      }
      return () => props.fill
    })
    return { getFill, bars }
  }
})
</script>
