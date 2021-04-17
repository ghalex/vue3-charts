import { ref, watch, computed, Ref } from 'vue'
// import * as r from 'ramda'
import useChart from './useChart'
import useMouse from './useMouse'

interface Return {
  position: Ref<{ x: number; y: number }>
  payload: any
  show: Ref<boolean>
}

export default (): Return => {
  const mouse = useMouse()
  const chart = useChart()
  const show = computed(() => mouse.hover)
  const position = ref({ x: 0, y: 0 })
  const payload = ref({})

  watch(mouse, () => {
    const { primary } = chart.scales
    const keys = chart.getKeys(0)
    const vals = chart.getData(keys) as number[]
    const [x] = primary.map([vals[mouse.index]])

    if (x) {
      if (chart.config.direction === 'horizontal') {
        position.value = {
          x,
          y: mouse.position.y
        }
      } else {
        position.value = {
          x: mouse.position.x,
          y: x
        }
      }
    }

    // const dKeys = chart.getKeys(1)
    const d = chart.data[mouse.index]

    if (d) {
      payload.value = d
    }
  })

  return { position, payload, show }
}
