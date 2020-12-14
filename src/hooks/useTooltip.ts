import { ref, watch, Ref } from 'vue'

import useLayers from './useLayers'
import usePlane from './usePlane'
import useScales from './useScales'

interface Return {
  position: Ref<{ x: number; y: number }>
  payload: any
}

export default (): Return => {
  const { data, mouseIdx } = usePlane()
  const { layers } = useLayers()
  const { xScale } = useScales()

  const position = ref({ x: 0, y: 0 })
  const payload = ref(null)

  watch(mouseIdx, (n) => {
    //if (n.x !== o.x) {
    position.value = {
      x: (xScale.value(n.x.toString()) || 0) + xScale.value.bandwidth() / 2,
      y: mouseIdx.value.y
    }

    const d = data.value[mouseIdx.value.x]
    if (d) {
      payload.value = generatePayload(d)
    } else {
      payload.value = null
    }
    //}
  })

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

  return { position, payload }
}
