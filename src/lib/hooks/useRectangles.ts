import { computed, ref, watch } from 'vue'
import { Rectangle } from '@/lib/types'

import usePlane from './usePlane'
import useScales from './useScales'
import useLayers from './useLayers'

export default (dataKey: string): any => {
  const rectangles = ref<Rectangle[]>([])
  const { data } = usePlane()
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
      let r: Rectangle
      if (d >= 0) {
        r = {
          x: (xScale.value(i.toString()) || 0) + index * barWidth + gap / 2,
          y: yScale.value(d),
          width: barWidth,
          height: yScale.value(0) - yScale.value(d),
          props: { d, idx: i }
        }
      } else {
        r = {
          x: (xScale.value(i.toString()) || 0) + index * barWidth + gap / 2,
          y: yScale.value(0),
          width: barWidth,
          height: yScale.value(d) - yScale.value(0),
          props: { d, idx: i }
        }
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
