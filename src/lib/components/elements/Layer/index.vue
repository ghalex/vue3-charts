<template>
  <g :class="`layer-${type}`">
    <slot />
  </g>
</template>

<script lang="ts">
import { useLayers } from '@/lib/hooks'
import { LayerType } from '@/lib/types'
import { defineComponent, onMounted } from 'vue'

export default defineComponent({
  name: 'Line',
  props: {
    type: {
      type: String as () => LayerType,
      required: true
    },
    dataKey: {
      type: String,
      default: 'value'
    },
    color: {
      type: String
    }
  },
  setup(props) {
    const { addLayer } = useLayers()

    onMounted(() => {
      addLayer({
        type: props.type,
        dataKey: props.dataKey,
        props: {
          color: props.color || 'black'
        }
      })
    })
    return {}
  }
})
</script>
