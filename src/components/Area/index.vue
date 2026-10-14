<template>
  <Layer type="area" :dataKeys="dataKeys">
    <path class="chart-area" v-bind="toSvgAttrs(style)" :d="d" />
  </Layer>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, ref, watch } from 'vue'
import { area, curveLinear, curveStep, curveNatural, curveMonotoneX, curveMonotoneY } from 'd3-shape'
import Layer from '../Layer/index.vue'
import { useBars, useChart, usePoints } from '@/hooks'
import { resolveStyle, toSvgAttrs } from '@/utils'
import { LayerProps, Point, Rectangle, StyleProp } from '@/types'
import type { CurveType } from '../Line/index.vue'

export default defineComponent({
  name: 'AreaComponent',
  components: { Layer },
  props: {
    areaStyle: {
      type: [Function, Object] as PropType<StyleProp<void>>,
      required: false
    },
    dataKeys: {
      type: Object as PropType<[string, string]>,
      required: true
    },
    type: {
      type: String as PropType<CurveType>,
      default: 'normal'
    },
    gap: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const chart = useChart()
    const { stacked = false } = inject<LayerProps>('layerProps', {})
    const { points } = usePoints(props.dataKeys, { stacked: false, type: 'area' })
    // Stacked areas are built from the stacked bar rectangles, which carry both ends of each segment.
    const { bars } = useBars(props.dataKeys, { stacked, type: 'area', gap: props.gap, maxWidth: -1 })
    const d = ref('')

    const curve = (type: CurveType) => {
      const map = {
        normal: curveLinear,
        natural: curveNatural,
        step: curveStep,
        monotone: chart.config.direction === 'horizontal' ? curveMonotoneX : curveMonotoneY
      }
      return map[type]
    }

    function update() {
      const { secondary } = chart.scales
      const baseline = secondary.at(0)

      if (stacked) {
        d.value =
          area<Rectangle>()
            .curve(curve(props.type))
            .x0((p) => p.x + p.width / 2)
            .y0((p) => p.y)
            .x1((p) => p.x + p.width / 2)
            .y1((p) => p.y + p.height)(bars.value) ?? ''
      } else if (chart.config.direction === 'vertical') {
        d.value =
          area<Point>()
            .curve(curve(props.type))
            .y0((p) => p.y)
            .y1((p) => p.y)
            .x0((p) => p.x)
            .x1(() => baseline)(points.value) ?? ''
      } else {
        d.value =
          area<Point>()
            .curve(curve(props.type))
            .x0((p) => p.x)
            .x1((p) => p.x)
            .y0((p) => p.y)
            .y1(() => baseline)(points.value) ?? ''
      }
    }

    const style = computed(() =>
      resolveStyle(props.areaStyle, undefined, { fill: 'blue', fillOpacity: 0.25, stroke: 'none' })
    )

    watch(stacked ? bars : points, update)
    watch(() => props.type, update)

    return { d, style, toSvgAttrs }
  }
})
</script>
