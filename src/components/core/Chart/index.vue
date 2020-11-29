<template>
  <svg class="chart" :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" ref="el">
    <slot />
  </svg>
</template>

<script lang="ts">
import { computed, defineComponent, provide, ref, watch } from 'vue'
import { Margin } from '@/types'
import { scaleBand, scaleLinear } from 'd3-scale'

export default defineComponent({
  name: 'Chart',
  props: {
    width: { type: Number },
    height: { type: Number },
    margin: {
      type: Object as () => Margin,
      default: { top: 0, right: 0, bottom: 0, left: 0 }
    },
    data: {
      type: Array as () => any[],
      default: []
    }
  },
  setup(props) {
    const el = ref(null)
    const xScale = ref(scaleBand())
    const yScale = ref(scaleLinear())
    const data = computed(() => props.data)

    provide('xScale', xScale)
    provide('yScale', yScale)
    provide('data', data)

    watch(
      props,
      () => {
        xScale.value = xScale.value.domain(props.data.map((x, i) => i.toString()))
      },
      { immediate: true }
    )

    return { el }
  }
})
</script>

<style></style>
