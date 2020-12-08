import { computed, inject, onMounted, ref, watch } from 'vue'
import { Layer, Point, Rectangle } from '@/types'

import usePlane from './usePlane'
import useScales from './useScales'

export default (layer: Layer): any => {
  const { plane } = usePlane()
  const { xScale, yScale } = useScales()

  const layers = inject('layers', ref<Layer[]>([]))

  const values = computed<number[]>(() => {
    return plane.value.data.map((d) => d[layer.dataKey])
  })
  const points = ref<Point[]>([])
  const rectangles = ref<Rectangle[]>([])

  function updatePoints() {
    console.log(plane.value.canvas)
    points.value = values.value.map((d, i) => {
      const p: Point = {
        x: (xScale.value(i.toString()) || 0) + xScale.value.bandwidth() / 2,
        y: yScale.value(d)
      }

      return p
    })
  }

  function updateRectangles() {
    const gap = 10
    const barLayers = layers.value.filter((l) => l.type === 'bar')
    const index = barLayers.findIndex((l) => l.dataKey === layer.dataKey && l.type === layer.type)
    const maxWidth = xScale.value.bandwidth() - gap
    const barWidth = barLayers.length > 0 ? maxWidth / barLayers.length : maxWidth

    rectangles.value = values.value.map((d, i) => {
      const r: Rectangle = {
        x: (xScale.value(i.toString()) || 0) + index * barWidth + gap / 2,
        y: yScale.value(d),
        width: barWidth,
        height: plane.value.canvas.height - yScale.value(d)
      }

      return r
    })
  }

  watch(
    layers,
    () => {
      updatePoints()
      if (layer.type === 'bar') {
        updateRectangles()
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    layers.value = [...layers.value, layer]
  })

  return {
    points,
    rectangles,
    values
  }
}
