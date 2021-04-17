<template>
  <g :class="`layer-${type}`">
    <slot />
  </g>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, onUnmounted } from 'vue'
import { useChart } from '@/hooks'
import { LayerType } from '@/types'

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
    const id = new Date().getTime().toString()
    const extraProps = inject('layerProps', {})

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
