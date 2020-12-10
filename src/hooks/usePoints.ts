import { computed, ref, watch } from 'vue'
import { Point } from '@/types'

import usePlane from './usePlane'
import useScales from './useScales'

export default (dataKey: string): any => {
  const points = ref<Point[]>([])
  const { data } = usePlane()
  const { xScale, yScale } = useScales()

  const values = computed<number[]>(() => {
    return data.value.map((d) => d[dataKey])
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

  watch(
    [xScale, yScale],
    () => {
      if (data.value.length > 0) {
        updatePoints()
      }
    },
    { immediate: true }
  )

  return {
    points
  }
}
