import * as r from 'ramda'
import { Ref, ref, watch } from 'vue'
import { Rectangle } from '@/types'
import useChart from './useChart'
import { Series } from 'd3-shape'

export interface BarsReturn {
  bars: Ref<Rectangle[]>
}

export default (dataKeys: [string, string], props = { maxWidth: 100, stacked: false, type: 'bar' }): BarsReturn => {
  const bars = ref<Rectangle[]>([])
  const chart = useChart()
  const gap = 5
  const { stacked, type } = props

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

    const barLayers = chart.getLayers('bar')
    return barLayers.findIndex((l) => l.dataKeys.join(',') === dataKeys.join(','))
  }

  function getBarWidth() {
    const { bandScale } = scales()
    const maxWidth = Math.min(bandScale.bandwidth() - gap, props.maxWidth)
    const barLayers = chart.getLayers('bar')

    return barLayers.length > 0 && !stacked ? maxWidth / barLayers.length : maxWidth
  }

  function updateBars(key: string, values: Series<{ [key: string]: number }, string>) {
    const { bandScale, linearScale } = scales()
    const index = getIndex()
    const barSize = getBarWidth()
    // const diff = (bandScale.bandwidth() - gap - maxWidth) / 2

    bars.value = values.map((val) => {
      let rect: Rectangle = { x: 0, y: 0, width: 0, height: 0, props: val }
      const xVal = bandScale.scale(val.data[key])
      const [yVal0, yVal1] = linearScale.map(val)

      if (chart.config.direction === 'horizontal') {
        rect.y = Math.min(yVal0, yVal1)
        rect.height = Math.abs(yVal0 - yVal1)

        rect.x = xVal + index * barSize + gap / 2
        rect.width = barSize
      } else {
        rect.x = Math.min(yVal0, yVal1)
        rect.width = Math.abs(yVal0 - yVal1)

        rect.y = xVal + index * barSize + gap / 2
        rect.height = barSize
      }

      return rect
    })

    // console.log(values)
  }

  function update() {
    const keys = chart.getStackedKeys(1, type)
    const [primaryKey, secondaryKey] = dataKeys
    const stack = chart.getStackedData(stacked ? keys : [dataKeys[1]])
    const data = stack.find((s) => s.key === secondaryKey)

    if (data) {
      updateBars(primaryKey, data)
    }
  }

  watch(chart.updates, () => {
    update()
  })

  return {
    bars
  }
}
