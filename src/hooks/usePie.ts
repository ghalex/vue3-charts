import { Ref, ref, watch } from 'vue'
import useChart from './useChart'
import { pie } from 'd3-shape'
import { Arc } from '@/types'

export interface PieReturn {
  wedges: Ref<Arc[]>
}

export default (dataKeys: [string, string]): PieReturn => {
  const wedges = ref<Arc[]>([])
  const chart = useChart()

  function getWedges(_key: string, values: number[]) {
    return pie()(values)
  }

  function update() {
    const keys = [dataKeys[1]]
    const [primaryKey] = dataKeys

    wedges.value = getWedges(primaryKey, chart.getData(keys))
  }

  watch(chart.updates, () => {
    update()
  })

  return {
    wedges
  }
}
