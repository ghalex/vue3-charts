import { Layer } from '@/lib/types'
import { computed, inject, ref, Ref } from 'vue'

interface Return {
  layers: Ref<Layer[]>
  layersData: Ref<number[]>
  layersKey: Ref<string[]>
  addLayer: (layer: Layer) => void
}

export default (): Return => {
  const layers = inject('layers', ref([] as Layer[]))
  const layersData = inject('layersData', ref([] as number[]))
  const layersKey = computed(() => {
    return layers.value.map((l) => l.dataKey)
  })

  function addLayer(layer: Layer) {
    layers.value = [...layers.value, layer]
  }

  return { layers, layersData, layersKey, addLayer }
}
