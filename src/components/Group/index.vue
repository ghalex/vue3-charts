<template>
  <slot />
</template>
<script lang="ts">
import { defineComponent, provide } from 'vue'

export default defineComponent({
  props: {
    stacked: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    provide('layerProps', props)
  }
})
</script>
