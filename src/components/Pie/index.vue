<template>
  <Layer :dataKeys="dataKeys" type="pie">
    <text v-if="arcs.length === 0">No Data</text>
    <g :transform="transform">
      <path
        v-for="(arc, i) in arcs"
        :key="i"
        :id="`arc-${i}`"
        class="chart-pie"
        v-bind="toKebabCase(pathStyle)"
        :fill="getColor(i)"
        :d="arcGen(arc)"
        @mousemove="showTooltip($event, i)"
        @mouseleave="hideTooltip()"
      />
    </g>
  </Layer>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useMouse, useChart } from '@/hooks'
import Layer from '../Layer/index.vue'
import { Arc, PieSort } from '@/types'
import { kebabize, mapKeys } from '@/utils'
import { pie, arc } from 'd3-shape'
import { scaleOrdinal } from 'd3-scale'
import { pointer } from 'd3-selection'
import { ascending, descending } from 'd3-array'

export default defineComponent({
  name: 'PieLayer',
  components: { Layer },
  props: {
    pieStyle: {
      type: [Function, Object],
      required: false
    },
    dataKeys: {
      type: Object as () => [string, string],
      required: true
    },
    sort: {
      type: PieSort,
      default: 'desc',
      required: false
    },
    sortFunc: {
      type: Function,
      required: false
    }
  },
  setup(props) {
    const chart = useChart()
    const mouse = useMouse()
    const arcs = ref<Arc[]>([])
    const size = ref(0)
    const transform = ref('')

    const style = computed(() => {
      const custom = typeof props.pieStyle === 'function' ? props.pieStyle() : props.pieStyle
      return {
        colors: ['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c'],
        innerRadius: 2,
        cornerRadius: 0,
        padAngle: 0.01,
        ...custom
      }
    })

    // Everything except `colors` is spread onto the <path>; the arc generator consumes the rest.
    const pathStyle = computed(() => {
      const { colors: _colors, innerRadius: _ir, cornerRadius: _cr, padAngle: _pa, ...rest } = style.value
      return rest
    })

    const colors = computed(() => scaleOrdinal<string, string>(style.value.colors))

    const pieSort = computed<((a: number, b: number) => number) | null>(() => {
      switch (props.sort) {
        case 'desc':
          return descending
        case 'asc':
          return ascending
        case 'custom':
          return (props.sortFunc as (a: number, b: number) => number) ?? null
        default:
          return null
      }
    })

    function arcGen(a: Arc) {
      return (
        arc()
          .outerRadius(size.value)
          .innerRadius(style.value.innerRadius)
          .cornerRadius(style.value.cornerRadius)
          .padAngle(style.value.padAngle)(a as any) ?? ''
      )
    }

    function updateLayout() {
      const { canvas } = chart
      size.value = Math.min(canvas.width - canvas.x, canvas.height - canvas.y) / 2
      transform.value = `translate(${size.value + canvas.x}, ${size.value + canvas.y})`
    }

    function updatePie() {
      const data = chart.getData([props.dataKeys[1]])
      const generator = pie<number>()
      const sorter = pieSort.value
      arcs.value = (sorter ? generator.sort(sorter) : generator.sort(null))(data)
    }

    function getColor(index: number) {
      return colors.value(index.toString())
    }

    function showTooltip(event: MouseEvent, index: number) {
      mouse.hover = true
      mouse.index = index
      const [x, y] = pointer(event)
      mouse.position = { x: x + size.value, y: y + size.value }
    }

    function hideTooltip() {
      mouse.hover = false
      mouse.index = -1
    }

    const toKebabCase = (data: any) => mapKeys(kebabize, data)

    watch(
      chart.updates,
      () => {
        updateLayout()
        updatePie()
      },
      { immediate: true }
    )
    watch(pieSort, updatePie)

    return {
      arcs,
      arcGen,
      pathStyle,
      transform,
      getColor,
      hideTooltip,
      toKebabCase,
      showTooltip
    }
  }
})
</script>
