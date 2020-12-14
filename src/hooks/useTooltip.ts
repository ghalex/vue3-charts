import { pointer, select } from 'd3-selection'
import { onMounted, ref } from 'vue'

import useLayers from './useLayers'
import usePlane from './usePlane'
import useScales from './useScales'

export default (): any => {
  const { chart, data } = usePlane()
  const { layers } = useLayers()
  const { xScale } = useScales()

  const mousePos = ref({ x: 0, y: 0 })
  const pos = ref({ x: 0, y: 0 })
  const payload = ref({} as any)
  const label = ref('')
  const index = ref(0)

  const isMouseOver = ref(false)

  function onMouseMove(e: any) {
    isMouseOver.value = true
    mousePos.value = { x: pointer(e)[0], y: pointer(e)[1] }

    const i = Math.round(mousePos.value.x / xScale.value.bandwidth()) - 1

    if (i > -1 && i < data.value.length) {
      const x = (xScale.value(i.toString()) || 0) + xScale.value.bandwidth() / 2

      pos.value = { x, y: mousePos.value.y }
      payload.value = generatePayload(data.value[i])
      label.value = ''
      index.value = i
    }
  }

  function generatePayload(rawData: any) {
    const res = {} as any

    for (const layer of layers.value) {
      res[layer.dataKey] = {
        key: layer.dataKey,
        color: layer.props.color,
        value: rawData[layer.dataKey]
      }
    }

    return res
  }

  function onMouseOut() {
    isMouseOver.value = false
  }

  onMounted(() => {
    select(chart.value).on('mousemove', onMouseMove).on('mouseout', onMouseOut)
  })

  return { mousePos, pos, payload, index, isMouseOver }
}
