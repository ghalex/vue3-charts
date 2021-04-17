import * as r from 'ramda'
import { ref, Ref, watch } from 'vue'
import { Point } from '@/types'
import { Series } from 'd3-shape'
import useChart from './useChart'

export interface PointsReturn {
  points: Ref<Point[]>
}

export default (dataKeys: [string, string], props = { stacked: false, type: 'line' }): PointsReturn => {
  const points = ref<Point[]>([])
  const chart = useChart()
  const { stacked, type } = props

  function updatePoints(key: string, values: Series<any, string>) {
    const { primary, secondary } = chart.scales

    const primaryVals = primary.map(values.map((v) => v.data[key])).filter((val) => !isNaN(val))
    const secondaryValues = secondary.map(values.map((v) => v[1])).filter((val) => !isNaN(val))

    if (primaryVals.length === secondaryValues.length) {
      if (chart.config.direction === 'horizontal') {
        points.value = r.zipWith((x, y) => ({ x, y }), primaryVals, secondaryValues)
      } else {
        points.value = r.zipWith((x, y) => ({ x, y }), secondaryValues, primaryVals)
      }
    }
  }

  function update() {
    const keys = chart.getStackedKeys(1, type)
    const [primaryKey, secondaryKey] = dataKeys
    const stack = chart.getStackedData(stacked ? keys : [dataKeys[1]])
    const data = stack.find((s) => s.key === secondaryKey)

    if (data) {
      updatePoints(primaryKey, data)
    }
  }

  watch(
    chart.updates,
    () => {
      update()
    },
    { immediate: true }
  )

  return {
    points
  }
}
