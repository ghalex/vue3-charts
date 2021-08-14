<template>
  <Layer :dataKeys="dataKeys" type="bar">
    <text v-if="bars.length === 0">No Data</text>
    <rect
      v-for="(bar, i) in bars"
      class="chart-bar"
      v-bind="
        toKebabCase(getStyle({ ...bar.props, active: i === mouse.index }))
      "
      :key="i"
      :x="bar.x"
      :y="bar.y"
      :width="bar.width > 0 ? bar.width : 0"
      :height="bar.height > 0 ? bar.height : 0"
    />
    <!-- :fill="getFill(bar.props)"
      :stroke-width="strokeWidth"
      :stroke="stroke" -->
  </Layer>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue'
import { useBars, useMouse } from '@/hooks'
import { is } from 'ramda'
import Layer from '../Layer/index.vue'
import { kebabize, mapKeys } from '@/utils'

export default defineComponent({
  name: 'Bar',
  components: { Layer },
  props: {
    barStyle: {
      type: [Function, Object],
      default: () => ({
        fill: 'blue'
      })
    },
    maxWidth: {
      type: Number,
      default: -1
    },
    dataKeys: {
      type: Object as () => [string, string],
      required: true
    },
    gap: {
      type: Number,
      default: 5
    }
  },
  setup(props) {
    const mouse = useMouse()
    const { stacked, maxWidth } = inject('layerProps', {
      stacked: false,
      maxWidth: -1
    })
    const { bars } = useBars(props.dataKeys, {
      maxWidth: Math.max(props.maxWidth, maxWidth),
      stacked,
      gap: props.gap,
      type: 'bar'
    })
    const getStyle = computed(() => {
      if (is(Function, props.barStyle)) {
        return props.barStyle
      }

      return () => props.barStyle
    })

    const toKebabCase = (data: any) => mapKeys(kebabize, data)
    return { getStyle, toKebabCase, bars, mouse }
  }
})
</script>
