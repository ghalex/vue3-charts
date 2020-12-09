import { computed, onMounted, ref, watch } from 'vue'
import { Layer, Point, Rectangle } from '@/types'

import usePlane from './usePlane'
import useScales from './useScales'
import useLayers from './useLayers'

export default (layer: Layer): any => {
  const points = ref<Point[]>([])
  const rectangles = ref<Rectangle[]>([])

  const { layers, addLayer } = useLayers()
  const { data, canvas } = usePlane()
  const { xScale, yScale } = useScales()

  const values = computed<number[]>(() => {
    return data.value.map((d) => d[layer.dataKey])
  })

  function updatePoints() {
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
        height: canvas.value.height - yScale.value(d)
      }

      return r
    })
  }

  watch(
    [xScale, yScale],
    () => {
      if (data.value.length > 0) {
        updatePoints()
        if (layer.type === 'bar') {
          updateRectangles()
        }
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    addLayer(layer)
  })

  return {
    points,
    rectangles,
    values
  }
}
