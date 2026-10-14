import { Ref, ref, watch } from 'vue'
import { Data, LayerProps, LayerType, Rectangle } from '@/types'
import useChart from './useChart'
import { Series } from 'd3-shape'

export interface BarsOptions extends LayerProps {
  gap?: number
  type?: LayerType
}

export interface BarsReturn {
  bars: Ref<Rectangle[]>
}

export default (dataKeys: [string, string], options: BarsOptions = {}): BarsReturn => {
  const bars = ref<Rectangle[]>([])
  const chart = useChart()
  const { stacked = false, type = 'bar', gap = 5, maxWidth = -1 } = options

  function scales() {
    const { primary, secondary } = chart.scales
    const bandScale = primary.type === 'band' ? primary : secondary
    const linearScale = primary.type === 'band' ? secondary : primary

    return { bandScale, linearScale }
  }

  function getIndex() {
    if (stacked) {
      return 0
    }

    const barLayers = chart.getLayers(type)
    const idx = barLayers.findIndex((l) => l.dataKeys.join(',') === dataKeys.join(','))

    return idx > -1 ? idx : 0
  }

  function getBarWidth() {
    const { bandScale } = scales()
    const available = bandScale.bandwidth() - gap
    const width = maxWidth > -1 ? Math.min(available, maxWidth) : available
    const barLayers = chart.getLayers(type)

    return barLayers.length > 0 && !stacked ? width / barLayers.length : width
  }

  function getDiffWidth() {
    if (stacked) {
      return 0
    }

    const { bandScale } = scales()
    const max = bandScale.bandwidth() - gap
    const total = chart.getLayers(type).length * getBarWidth()
    return (max - total) / 2
  }

  function getBars(key: string, values: Series<Data, string>) {
    const { bandScale, linearScale } = scales()
    const index = getIndex()
    const barSize = getBarWidth()
    const diff = getDiffWidth()

    return values.map((val) => {
      const rect: Rectangle = { x: 0, y: 0, width: 0, height: 0, props: { values: [...val], data: val.data } }
      const xVal = bandScale.at(val.data[key])
      const [yVal0, yVal1] = linearScale.map([...val])

      if (chart.config.direction === 'horizontal') {
        rect.y = Math.min(yVal0, yVal1)
        rect.height = Math.abs(yVal0 - yVal1)

        rect.x = diff + xVal + index * barSize + gap / 2
        rect.width = barSize
      } else if (chart.config.direction === 'vertical') {
        rect.x = Math.min(yVal0, yVal1)
        rect.width = Math.abs(yVal0 - yVal1)

        rect.y = diff + xVal + index * barSize + gap / 2
        rect.height = barSize
      }
      return rect
    })
  }

  function update() {
    const keys = stacked ? chart.getStackedKeys(1, type) : [dataKeys[1]]
    const [primaryKey, secondaryKey] = dataKeys
    const stack = chart.getStackedData(keys)
    const data = stack.find((s) => s.key === secondaryKey)

    if (data) {
      bars.value = getBars(primaryKey, data)
    }
  }

  watch(chart.updates, update)

  return {
    bars
  }
}
