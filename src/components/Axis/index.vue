<template>
  <g v-if="position === 'bottom'" :class="`layer-axis-x`" ref="el" :transform="`translate(0, ${canvas.height})` " />
  <g v-else :class="`layer-axis-y`" ref="el" :transform="`translate(${canvas.x}, 0)`" />
</template>

<script lang="ts">
// import * as r from 'ramda'
// import { format } from 'd3-format'
import type { Axis } from 'd3-axis'
import type { PropType } from 'vue'
import type { Canvas } from '@/types'

import { computed, defineComponent, ref, watch } from 'vue'
import { select } from 'd3-selection'
import { axisBottom, axisLeft } from 'd3-axis'
import { useChart } from '@/hooks'

export default defineComponent({
  name: 'Axis',
  props: {
    position: {
      type: String as PropType<'bottom' | 'left'>,
      default: 'bottom'
    },
    rotate: {
      type: Boolean,
      default: false
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const el = ref<SVGGElement>()
    const chart = useChart()

    const axis = computed(() => {
      return props.position === 'bottom' ? axisBottom : axisLeft
    })

    const canvas = ref<Canvas>(chart.canvas)

    const defaultConfig = { ticks: 5 }

    function drawAxis() {
      if (chart.data.length > 0) {
        const { primary, secondary } = chart.scales
        const current = props.isPrimary ? primary : secondary
        const config = Object.assign(
          {},
          props.isPrimary ? primary.config : secondary.config,
          defaultConfig
        )

        const ax: Axis<any> = axis.value(current.scale)

        if (config.format) {
          ax.tickFormat(config.format)
        }

        if (config.ticks !== undefined) {
          ax.ticks(config.ticks)
        }

        if (config.tickValues !== undefined) {
          ax.tickValues(config.tickValues)
        }

        if (config.useConfig) {
          config.useConfig(ax)
        }

        const res = select(el.value!).call(ax)

        if (props.position === 'bottom' && props.rotate) {
          res.selectAll('text')
            .attr('y', 0)
            .attr('x', 9)
            .attr('dy', '.35em')
            .attr('transform', 'rotate(90)')
            .style('text-anchor', 'start')
        }

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
      canvas.value = chart.canvas
      drawAxis()
    })

    return { el, canvas }
  }
})
</script>
