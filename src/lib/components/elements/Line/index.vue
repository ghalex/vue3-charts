<template>
  <Layer type="line" :dataKey="dataKey" :color="stroke">
    <path
      :d="d"
      fill="none"
      :stroke="stroke"
      :stroke-width="strokeWidth"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    <g v-if="dot">
      <circle
        :fill="i === mouseIdx.x ? dotActiveProps.fill : dotProps.fill"
        :stroke="i === mouseIdx.x ? dotActiveProps.stroke : dotProps.stroke"
        :stroke-width="dotProps.strokeWidth"
        :r="i === mouseIdx.x ? dotActiveProps.r : dotProps.r"
        v-for="(c, i) in points"
        :key="i"
        :cx="c.x"
        :cy="c.y"
      />
    </g>
  </Layer>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { line, curveLinear, curveStep, curveNatural, curveMonotoneX } from 'd3-shape'
import { usePlane, usePoints } from '@/lib/hooks'
import { Point } from '@/lib/types'
import Layer from '../Layer/index.vue'

export default defineComponent({
  name: 'Line',
  components: { Layer },
  props: {
    stroke: {
      type: String,
      default: '#8884d8'
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    dot: {
      type: Object,
      default: () => ({
        r: 3
      })
    },
    activeDot: {
      type: Object,
      default: () => ({
        r: 5
      })
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
    const lineType = {
      normal: curveLinear,
      natural: curveNatural,
      step: curveStep,
      monotone: curveMonotoneX
    }

    const buildLine = line<Point>()
      .x((p) => p.x)
      .y((p) => p.y)
      .curve(lineType[props.type])

    const { mouseIdx } = usePlane()
    const { points } = usePoints(props.dataKey)
    const d = computed(() => buildLine(points.value))
    const dotProps = computed(() => ({
      stroke: props.stroke,
      strokeWidth: props.strokeWidth,
      fill: 'white',
      r: 3,
      ...props.dot
    }))

    const dotActiveProps = computed(() => ({
      ...dotProps.value,
      ...props.activeDot
    }))

    return { d, points, mouseIdx, dotProps, dotActiveProps }
  }
})
</script>
