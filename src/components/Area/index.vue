<template>
  <Layer type="area" :dataKeys="dataKeys">
    <path :d="d" :fill="fill" :stroke="none" opacity="0.3" />
  </Layer>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue'
import { area, curveLinear, curveStep, curveNatural, curveMonotoneX } from 'd3-shape'
import Layer from '../Layer/index.vue'
import { useBars, useChart, usePoints } from '@/hooks'
// import { Point, Rectangle } from '@/types'

export default defineComponent({
  name: 'Area',
  components: { Layer },
  props: {
    fill: {
      type: String,
      default: 'blue'
    },
    dataKeys: {
      type: Object as () => [string, string],
      required: true
    },
    type: {
      type: String as () => 'normal' | 'step' | 'natural' | 'monotone',
      default: () => 'normal'
    }
  },
  setup(props) {
    const chart = useChart()
    const { stacked } = inject('layerProps', { stacked: false })
    const { points } = usePoints(props.dataKeys, { stacked: false, type: 'area' })
    const { bars } = useBars(props.dataKeys, { stacked, type: 'area', maxWidth: -1 })

    const lineType = {
      normal: curveLinear,
      natural: curveNatural,
      step: curveStep,
      monotone: curveMonotoneX
    }

    const buildArea = computed(() => {
      const { secondary } = chart.scales
      if (stacked) {
        return area<any>()
          .curve(lineType[props.type])
          .x0((p) => p.x + p.width / 2)
          .y0((p) => p.y)
          .x1((p) => p.x + p.width / 2)
          .y1((p) => p.y + p.height)
      }

      return area<any>()
        .curve(lineType[props.type])
        .x0((p) => p.x)
        .x1((p) => p.x)
        .y0((p) => p.y)
        .y1((_) => secondary.scale(0))
    })

    const d = computed(() => {
      return stacked ? buildArea.value(bars.value) : buildArea.value(points.value)
    })

    return { d }
  }
})
</script>
