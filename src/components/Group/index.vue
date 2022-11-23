<template>
  <div>
    <slot />
  </div>
</template>
<script lang="ts">
import { defineComponent, provide } from 'vue'

export default defineComponent({
  props: {
    stacked: {
      type: Boolean,
      default: false
    },
    maxWidth: {
      type: Number,
      default: -1
    }
  },
  setup(props) {
    provide('layerProps', props)
  }
})
</script>
