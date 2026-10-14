<template>
  <Layer :dataKeys="dataKeys" type="line">
    <path class="chart-line" v-bind="toSvgAttrs(style)" :d="d" fill="none" />
    <g v-if="!hideDot">
      <circle
        v-for="(c, i) in points"
        :key="i"
        v-bind="toSvgAttrs(dotStyleAt(i))"
        class="chart-dot"
        :cx="c.x"
        :cy="c.y"
      />
    </g>
  </Layer>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, ref, watch } from 'vue'
import { line, curveLinear, curveStepAfter, curveNatural, curveMonotoneX, curveMonotoneY } from 'd3-shape'
import { LayerProps, Point, StyleProp } from '@/types'
import { useChart, useMouse, usePoints } from '@/hooks'
import Layer from '../Layer/index.vue'
import { resolveStyle, toSvgAttrs } from '@/utils'

export type DotStyleArgs = { active: boolean; index: number }
export type CurveType = 'normal' | 'step' | 'natural' | 'monotone'

export default defineComponent({
  name: 'LineComponent',
  components: { Layer },
  props: {
    lineStyle: {
      type: [Function, Object] as PropType<StyleProp<void>>,
      required: false
    },
    dotStyle: {
      type: [Function, Object] as PropType<StyleProp<DotStyleArgs>>,
      required: false
    },
    hideDot: {
      type: Boolean,
      default: false
    },
    dataKeys: {
      type: Object as PropType<[string, string]>,
      required: true
    },
    type: {
      type: String as PropType<CurveType>,
      default: 'normal'
    }
  },
  setup(props) {
    const { stacked = false } = inject<LayerProps>('layerProps', {})
    const mouse = useMouse()
    const chart = useChart()
    const d = ref('')
    const { points } = usePoints(props.dataKeys, { stacked, type: 'line' })

    const curves = {
      normal: curveLinear,
      natural: curveNatural,
      step: curveStepAfter,
      monotone: curveMonotoneX
    }

    function updateLine() {
      const curve =
        props.type === 'monotone' && chart.config.direction === 'vertical' ? curveMonotoneY : curves[props.type]

      d.value =
        line<Point>()
          .x((p) => p.x)
          .y((p) => p.y)
          .curve(curve)(points.value) ?? ''
    }

    const style = computed(() => resolveStyle(props.lineStyle, undefined, { stroke: '#8884d8', strokeWidth: 2 }))

    function dotStyleAt(index: number) {
      const active = index === mouse.index
      return resolveStyle(
        props.dotStyle,
        { active, index },
        { r: active ? 5 : 3, stroke: style.value.stroke, strokeWidth: style.value.strokeWidth, fill: 'white' }
      )
    }

    watch(points, updateLine)
    watch(chart.updates, updateLine)
    watch(() => props.type, updateLine)

    return { d, mouse, points, style, dotStyleAt, toSvgAttrs }
  }
})
</script>
