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

  function getPoints(key: string, values: Series<any, string>): Point[] {
    const { primary, secondary } = chart.scales

    if (chart.config.direction === 'horizontal') {
      const res = values
        .map((val) => {
          return {
            x: primary.mapOne(val.data[key]),
            y: secondary.mapOne(val[1]),
            props: { values: [...val], data: val.data }
          }
        })
        .filter((p) => !isNaN(p.x) && !isNaN(p.y))

      console.log(res)
      return res
    } else if (chart.config.direction === 'vertical') {
      return values
        .map((val) => {
          return {
            x: secondary.mapOne(val[1]),
            y: primary.mapOne(val.data[key]),
            props: { values: [...val], data: val.data }
          }
        })
        .filter((p) => !isNaN(p.x) && !isNaN(p.y))
    }
    return []
  }

  function update() {
    const keys = chart.getStackedKeys(1, type)
    const [primaryKey, secondaryKey] = dataKeys
    const stack = chart.getStackedData(stacked ? keys : [dataKeys[1]])
    const data = stack.find((s) => s.key === secondaryKey)

    if (data) {
      points.value = getPoints(primaryKey, data)
    }
  }

  watch(
    chart.updates,
    () => {
      update()
      console.log('update')
    },
    { immediate: true }
  )

  return {
    points
  }
}
