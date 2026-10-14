import { ref, Ref, watch } from 'vue'
import { Data, LayerProps, LayerType, Point } from '@/types'
import { Series } from 'd3-shape'
import useChart from './useChart'

export interface PointsOptions extends LayerProps {
  type?: LayerType
}

export interface PointsReturn {
  points: Ref<Point[]>
}

export default (dataKeys: [string, string], options: PointsOptions = {}): PointsReturn => {
  const points = ref<Point[]>([])
  const chart = useChart()
  const { stacked = false, type = 'line' } = options

  function getPoints(key: string, values: Series<Data, string>): Point[] {
    const { primary, secondary } = chart.scales
    const { direction } = chart.config

    if (direction !== 'horizontal' && direction !== 'vertical') {
      return []
    }

    return values
      .map((val) => {
        const along = primary.mapOne(val.data[key])
        const across = secondary.mapOne(val[1])
        return {
          x: direction === 'horizontal' ? along : across,
          y: direction === 'horizontal' ? across : along,
          props: { values: [...val], data: val.data }
        }
      })
      .filter((p) => !isNaN(p.x) && !isNaN(p.y))
  }

  function update() {
    const keys = stacked ? chart.getStackedKeys(1, type) : [dataKeys[1]]
    const [primaryKey, secondaryKey] = dataKeys
    const stack = chart.getStackedData(keys)
    const data = stack.find((s) => s.key === secondaryKey)

    if (data) {
      points.value = getPoints(primaryKey, data)
    }
  }

  watch(chart.updates, update, { immediate: true })

  return {
    points
  }
}
