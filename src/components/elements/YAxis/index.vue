<template>
  <g :class="`layer-axis-y`" ref="el" :transform="`translate(${left}, 0)`" />
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { select } from 'd3-selection'
import { axisLeft } from 'd3-axis'
import { usePlane, useScales } from '@/hooks'

export default defineComponent({
  name: 'YAxis',
  setup() {
    const el = ref(null)
    const { canvas, data } = usePlane()
    const { yScale } = useScales()
    const left = computed(() => {
      return canvas.value.x
    })

    function drawAxis() {
      if (data.value.length > 0) {
        const ax: any = axisLeft(yScale.value).ticks(Math.round(canvas.value.height / 60)) // .tickValues([0, 1, 3])
        select(el.value).call(ax)
      }
    }

    watch(yScale, () => drawAxis())

    return { el, left }
  }
})
</script>

<style></style>
