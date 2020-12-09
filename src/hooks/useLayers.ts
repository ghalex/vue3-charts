import { Layer } from '@/types'
import { inject, ref, Ref } from 'vue'

interface Return {
  layers: Ref<Layer[]>
  layersData: Ref<number[]>
  addLayer: (layer: Layer) => void
}

export default (): Return => {
  const layers = inject('layers', ref([] as Layer[]))
  const layersData = inject('layersData', ref([] as number[]))

  function addLayer(layer: Layer) {
    layers.value = [...layers.value, layer]
  }

  // function findLayer(type)

  // watch(layers, (n) => {
  //   console.log(n)
  // })

  return { layers, layersData, addLayer }
}
