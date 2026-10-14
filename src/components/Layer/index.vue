<template>
  <g :class="`layer-${type}`">
    <slot />
  </g>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, onUnmounted } from 'vue'
import { useChart } from '@/hooks'
import { LayerProps, LayerType } from '@/types'

let nextLayerId = 0

export default defineComponent({
  name: 'Layer',
  props: {
    type: {
      type: String as () => LayerType,
      default: 'custom'
    },
    dataKeys: {
      type: Object as () => [string, string],
      required: true
    }
  },
  setup(props) {
    const chart = useChart()
    const id = `layer-${nextLayerId++}`
    const extraProps = inject<LayerProps>('layerProps', {})

    onMounted(() => {
      chart.addLayer({ id, type: props.type, dataKeys: props.dataKeys, props: extraProps })
    })

    onUnmounted(() => {
      chart.removeLayer(id)
    })
    return {}
  }
})
</script>
