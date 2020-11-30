<template>
  <g class="layer-area">
    <path :d="d" :fill="fill" :stroke="none" opacity="0.3" />
  </g>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue'
import { area, curveLinear } from 'd3-shape'
import { useLayer } from '@/hooks'
import { Point } from '@/types'
import { ObjectId } from 'bson'

export default defineComponent({
  name: 'Area',
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
    const { points, canvas } = useLayer({ id: new ObjectId().toHexString(), type: 'line', dataKey: props.dataKey })
    const buildArea = computed(() =>
      area<Point>()
        .curve(curveLinear)
        .x((p) => p.x)
        .y0(() => canvas.height)
        .y1((p) => p.y)
    )

    const d = computed(() => buildArea.value(points.value))

    watch(points, () => {
      console.log('new points in area')
    })
    return { d, points }
  }
})
</script>

<style></style>
