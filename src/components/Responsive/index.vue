<template>
  <div ref="el">
    <slot name="main" :width="width" :height="height" />
  </div>
</template>

<script lang="ts">
import { useResize } from '@/hooks'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Responsive',
  setup() {
    const el = ref(null)
    const { width, height } = useResize(el)

    return { el, width, height }
  }
})
</script>

<style></style>
