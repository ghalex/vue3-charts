<template>
  <g :class="`layer-axis-x`" ref="el" :transform="`translate(0, ${height})`" />
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { select } from 'd3-selection'
import { axisBottom } from 'd3-axis'
import { usePlane, useScales } from '@/hooks'

export default defineComponent({
  name: 'XAxis',
  props: {
    dataKey: {
      type: String,
      default: 'name'
    },
    domain: {
      type: Object as () => [string, string],
      default: () => ['dataMin', 'dataMax']
    }
  },
  setup(props) {
    const el = ref(null)
    const { canvas, data } = usePlane()
    const { xScale } = useScales()
    const height = computed(() => {
      return canvas.value.height
    })

    function drawAxis() {
      if (data.value.length > 0) {
        const ax: any = axisBottom(xScale.value).tickFormat((_, index: number) => {
          return data.value.map((x) => x[props.dataKey])[index]
        })

        select(el.value).call(ax)
      }
    }

    watch(xScale, () => drawAxis())

    return { el, height }
  }
})
</script>

<style></style>
