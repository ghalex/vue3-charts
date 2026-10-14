import { ref, watch, computed, Ref } from 'vue'
import useChart from './useChart'
import useMouse from './useMouse'

export interface TooltipPayload {
  [key: string]: string | number
}

interface Return {
  position: Ref<{ x: number; y: number }>
  payload: Ref<TooltipPayload>
  show: Ref<boolean>
}

export default (): Return => {
  const mouse = useMouse()
  const chart = useChart()
  const show = computed(() => mouse.hover)
  const position = ref({ x: 0, y: 0 })
  const payload = ref<TooltipPayload>({})

  watch(mouse, () => {
    const { primary } = chart.scales
    const vals = chart.getData(chart.getKeys(0))
    const x = vals[mouse.index] === undefined ? NaN : primary.mapOne(vals[mouse.index])

    if (!isNaN(x)) {
      if (chart.config.direction === 'horizontal') {
        position.value = { x, y: mouse.position.y }
      } else if (chart.config.direction === 'vertical') {
        position.value = { x: mouse.position.x, y: x }
      } else {
        position.value = { x: mouse.position.x, y: mouse.position.y }
      }
    }

    const d = chart.data[mouse.index]

    if (d) {
      payload.value = { ...d, idx: mouse.index }
    }
  })

  return { position, payload, show }
}
