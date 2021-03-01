<template>
  <g :class="`layer-axis-y`" ref="el" :transform="`translate(${left}, 0)`" />
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { select } from 'd3-selection'
import { axisLeft } from 'd3-axis'
import { format } from 'd3-format'
import { is } from 'ramda'
import { usePlane, useScales } from '@/lib/hooks'

export default defineComponent({
  name: 'YAxis',
  props: {
    domain: {
      type: Object as () => [string, string],
      default: () => ['dataMin', 'dataMax']
    },
    ticks: {
      type: Number,
      default: -1
    },
    tickValues: {
      type: Array,
      default: () => null
    },
    format: {
      type: [String, Function],
      default: ',.0f'
    }
  },
  setup(props) {
    const el = ref(null)
    const { canvas, data, domain } = usePlane()
    const { yScale } = useScales()
    const left = computed(() => {
      return canvas.value.x
    })

    function drawAxis() {
      if (data.value.length > 0) {
        const formatFn = is(Function, props.format) ? (props.format as any) : format
        const ax: any = axisLeft(yScale.value).tickFormat(formatFn(props.format))

        if (props.ticks > -1) {
          ax.ticks(props.ticks)
        } else if (props.tickValues) {
          ax.tickValues(props.tickValues)
        } else {
          ax.ticks(Math.round(canvas.value.height / 60))
        }

        select(el.value).call(ax)
        return ax
      }

      return null
    }

    watch(yScale, () => drawAxis())
    watch(
      props,
      () => {
        domain.value = props.domain
        drawAxis()
      },
      { immediate: true }
    )

    return { el, left }
  }
})
</script>
