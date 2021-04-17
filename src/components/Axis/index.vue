<template>
  <g v-if="position === 'bottom'" :class="`layer-axis-x`" ref="el" :transform="`translate(0, ${canvas.height})`" />
  <g v-else :class="`layer-axis-y`" ref="el" :transform="`translate(${canvas.x}, 0)`" />
</template>

<script lang="ts">
// import * as r from 'ramda'
// import { format } from 'd3-format'
import { computed, defineComponent, ref, watch } from 'vue'
import { select } from 'd3-selection'
import { axisBottom, axisLeft } from 'd3-axis'
import { useChart } from '@/hooks'

export default defineComponent({
  name: 'Axis',
  props: {
    position: {
      type: String as () => 'bottom' | 'left',
      default: 'bottom'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const el = ref(null)
    const chart = useChart()

    const axis = computed(() => {
      return props.position === 'bottom' ? axisBottom : axisLeft
    })

    const canvas = computed(() => {
      return chart.canvas
    })

    function drawAxis() {
      if (chart.data.length > 0) {
        const { primary, secondary } = chart.scales
        const current = props.isPrimary ? primary : secondary
        const config = props.isPrimary ? primary.config : secondary.config

        const ax: any = axis.value(current.scale).ticks(5)

        if (config.format) {
          ax.tickFormat(config.format)
        }

        if (config.ticks !== undefined) {
          ax.ticks(config.ticks)
        }

        if (config.tickValues !== undefined) {
          ax.tickValues(config.tickValues)
        }

        select(el.value).call(ax)
        return ax
      }

      return null
    }

    watch(
      () => props.isPrimary,
      () => {
        drawAxis()
      }
    )

    watch(chart.updates, () => {
      drawAxis()
    })

    return { el, canvas }
  }
})
</script>
