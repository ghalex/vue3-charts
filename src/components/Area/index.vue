<template>
  <Layer type="area" :dataKeys="dataKeys">
    <path v-bind="toKebabCase(getStyle())" :d="d" />
  </Layer>
</template>

<script lang="ts">
import { computed, defineComponent, inject, watch, ref } from 'vue'
import {
  area,
  curveLinear,
  curveStep,
  curveNatural,
  curveMonotoneX,
  curveMonotoneY
} from 'd3-shape'
import Layer from '../Layer/index.vue'
import { useBars, useChart, usePoints } from '@/hooks'
import { kebabize, mapKeys } from '@/utils'

export default defineComponent({
  name: 'AreaComponent',
  components: { Layer },
  props: {
    areaStyle: {
      type: Object,
      required: false
    },
    dataKeys: {
      type: Object as () => [string, string],
      required: true
    },
    type: {
      type: String as () => 'normal' | 'step' | 'natural' | 'monotone',
      default: () => 'normal'
    },
    gap: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const chart = useChart()
    const { stacked } = inject('layerProps', { stacked: false })
    const { points } = usePoints(props.dataKeys, {
      stacked: false,
      type: 'area'
    })
    const { bars } = useBars(props.dataKeys, {
      stacked,
      type: 'area',
      gap: props.gap,
      maxWidth: -1
    })
    const d = ref<string | null>('')

    const lineType = (type: any) => {
      // console.log(type, chart.config.direction)
      const map: any = {
        normal: curveLinear,
        natural: curveNatural,
        step: curveStep,
        monotone:
          chart.config.direction === 'horizontal'
            ? curveMonotoneX
            : curveMonotoneY
      }

      return map[type]
    }

    const buildArea = () => {
      console.log(points.value)
      const { secondary } = chart.scales
      if (stacked) {
        return area<any>()
          .curve(lineType(props.type))
          .x0((p) => p.x + p.width / 2)
          .y0((p) => p.y)
          .x1((p) => p.x + p.width / 2)
          .y1((p) => p.y + p.height)
      }

      if (chart.config.direction === 'vertical') {
        return area<any>()
          .curve(lineType(props.type))
          .y0((p) => p.y)
          .y1((p) => p.y)
          .x0((p) => p.x)
          .x1(() => secondary.scale(0))
      }

      return area<any>()
        .curve(lineType(props.type))
        .x0((p) => p.x)
        .x1((p) => p.x)
        .y0((p) => p.y)
        .y1(() => secondary.scale(0))
    }

    const getStyle = computed(() => {
      return () => ({
        fill: 'blue',
        fillOpacity: 0.25,
        stroke: 'none',
        ...props.areaStyle
      })
    })

    const toKebabCase = (data: any) => mapKeys(kebabize, data)

    watch(points, () => {
      d.value = stacked ? buildArea()(bars.value) : buildArea()(points.value)
    })

    return { d, getStyle, toKebabCase }
  }
})
</script>
