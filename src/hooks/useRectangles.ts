import { computed, ref, watch } from 'vue'
import { Rectangle } from '@/types'

import usePlane from './usePlane'
import useScales from './useScales'
import useLayers from './useLayers'

export default (dataKey: string): any => {
  const rectangles = ref<Rectangle[]>([])
  const { data, canvas } = usePlane()
  const { xScale, yScale } = useScales()
  const { layers } = useLayers()

  const values = computed<number[]>(() => {
    return data.value.map((d) => d[dataKey])
  })

  function updateRectangles() {
    const gap = 10
    const barLayers = layers.value.filter((l) => l.type === 'bar')
    const index = barLayers.findIndex((l) => l.dataKey === dataKey)
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
        updateRectangles()
      }
    },
    { immediate: true }
  )

  return {
    rectangles
  }
}
