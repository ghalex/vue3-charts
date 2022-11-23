<template>
  <Layer :dataKeys="dataKeys" type="line">
    <path class="chart-line" v-bind="toKebabCase(getStyle())" :d="d" fill="none" />
    <!-- :stroke="stroke"
      :stroke-width="strokeWidth"
      stroke-linejoin="round"
      stroke-linecap="round" -->
    <g v-if="!hideDot">
      <circle
        v-bind="toKebabCase(getDotStyle({ active: i === mouse.index }))"
        v-for="(c, i) in points"
        :key="i"
        :cx="c.x"
        :cy="c.y"
      />
    </g>
  </Layer>
</template>

<script lang="ts">
import { computed, defineComponent, watch, ref, inject } from 'vue'
import { line, curveLinear, curveStepAfter, curveNatural, curveMonotoneX, curveMonotoneY } from 'd3-shape'
import { Point } from '@/types'
import { is } from 'ramda'
import { useChart, useMouse, usePoints } from '@/hooks'
import Layer from '../Layer/index.vue'
import { kebabize, mapKeys } from '@/utils'

export default defineComponent({
  name: 'LineComponent',
  components: { Layer },
  props: {
    lineStyle: {
      type: Object,
      required: false
    },
    dotStyle: {
      type: Object,
      required: false
    },
    hideDot: {
      type: Boolean,
      default: false
    },
    dataKeys: {
      type: Object as () => [string, string],
      required: true
    },
    type: {
      type: String as () => 'normal' | 'step' | 'natural' | 'monotone',
      default: () => 'normal'
    }
  },
  setup(props) {
    const { stacked } = inject('layerProps', { stacked: false })
    const mouse = useMouse()
    const chart = useChart()
    const d = ref<string | null>('')
    const { points } = usePoints(props.dataKeys, { stacked, type: 'line' })

    const lineType = {
      normal: curveLinear,
      natural: curveNatural,
      step: curveStepAfter,
      monotone: curveMonotoneX
    }

    function updateLine() {
      let type = lineType[props.type]

      if (props.type === 'monotone' && chart.config.direction === 'vertical') {
        type = curveMonotoneY
      }

      d.value = line<Point>()
        .x((p) => p.x)
        .y((p) => p.y)
        .curve(type)(points.value)
    }

    function computeDotStyle(active: boolean) {
      const dotStyle = props.dotStyle
      const style = getStyle.value()

      return {
        r: active ? 5 : 3,
        stroke: style.stroke,
        strokeWidth: style.strokeWidth,
        fill: 'white',
        ...dotStyle
      }
    }

    const getStyle = computed(() => {
      if (is(Function, props.lineStyle)) {
        return props.lineStyle as () => any
      }

      return () => ({
        stroke: '#8884d8',
        strokeWidth: 2,
        ...props.lineStyle
      })
    })

    const getDotStyle = computed(() => {
      if (is(Function, props.dotStyle)) {
        return props.dotStyle
      }

      return ({ active }: { active: boolean }) => computeDotStyle(active)
    })

    watch(points, () => updateLine())
    watch(chart.updates, () => updateLine())

    const toKebabCase = (data: any) => mapKeys(kebabize, data)
    return { d, mouse, points, toKebabCase, getStyle, getDotStyle }
  }
})
</script>
