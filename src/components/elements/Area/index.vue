<template>
  <Layer type="area" :dataKey="dataKey" :color="fill">
    <path :d="d" :fill="fill" :stroke="none" opacity="0.3" />
  </Layer>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { area, curveLinear, curveStep, curveNatural, curveMonotoneX } from 'd3-shape'
import { usePlane, usePoints } from '@/hooks'
import Layer from '../Layer/index.vue'
import { Point } from '@/types'

export default defineComponent({
  name: 'Area',
  components: { Layer },
  props: {
    fill: {
      type: String,
      default: 'blue'
    },
    dataKey: {
      type: String,
      default: 'value'
    },
    type: {
      type: String as () => 'normal' | 'step' | 'natural' | 'monotone',
      default: () => 'normal'
    }
  },
  setup(props) {
    const { canvas } = usePlane()
    const { points } = usePoints(props.dataKey)
    const lineType = {
      normal: curveLinear,
      natural: curveNatural,
      step: curveStep,
      monotone: curveMonotoneX
    }

    const buildArea = computed(() =>
      area<Point>()
        .curve(lineType[props.type])
        .x((p) => p.x)
        .y0(() => canvas.value.height)
        .y1((p) => p.y)
    )

    const d = computed(() => buildArea.value(points.value))

    return { d, points }
  }
})
</script>

<style></style>
