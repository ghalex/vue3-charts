<template>
  <g :class="`axis-x`" ref="el" :transform="`translate(0, ${canvas.height - 20})`" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { select } from 'd3-selection'
import { axisBottom } from 'd3-axis'
import { usePlane, useScales } from '@/hooks'

export default defineComponent({
  name: 'XAxis',
  setup() {
    const el = ref(null)
    const { plane } = usePlane()
    const { xScale } = useScales()

    function drawAxis() {
      const ax: any = axisBottom(xScale.value).tickValues([0, 1, 3])
      select(el.value).call(ax)
    }

    watch(xScale, () => {
      console.log('new x scale', xScale.value.domain())
      drawAxis()
    })

    return { el, canvas: plane.value.canvas }
  }
})
</script>

<style></style>
