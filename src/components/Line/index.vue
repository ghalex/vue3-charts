<template>
  <g class="layer-line">
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
        :fill="dotProps.fill"
        :stroke="dotProps.stroke"
        :stroke-width="dotProps.strokeWidth"
        :r="dotProps.r"
        v-for="(c, i) in points"
        :key="i"
        :cx="c.x"
        :cy="c.y"
      />
    </g>
  </g>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { line, curveLinear } from 'd3-shape'
import { useLayer } from '@/hooks'
import { Point } from '@/types'
import { ObjectId } from 'bson'

export default defineComponent({
  name: 'Line',
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
    dataKey: {
      type: String,
      default: 'value'
    }
  },
  setup(props) {
    const buildLine = line<Point>()
      .x((p) => p.x)
      .y((p) => p.y)
      .curve(curveLinear)

    const { points } = useLayer({ id: new ObjectId().toHexString(), type: 'line', dataKey: props.dataKey })
    const d = computed(() => buildLine(points.value))
    const dotProps = computed(() => ({
      stroke: props.stroke,
      strokeWidth: props.strokeWidth,
      fill: 'white',
      r: 3,
      ...props.dot
    }))

    return { d, points, dotProps }
  }
})
</script>

<style></style>
