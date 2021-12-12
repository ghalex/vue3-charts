<template>
  <Layer :dataKeys="dataKeys" type="pie">
    <text v-if="arcs.length === 0">No Data</text>
    <g :transform="transform">
      <path
        v-for="(arc, i) in arcs"
        :key="i"
        :id="`arc-${i}`"
        class="chart-pie"
        v-bind="toKebabCase(getStyle())"
        :fill="getColor(i)"
        :d="arcGen()(arc)"
        @mousemove="showTooltip($event, i)" @mouseleave="hideTooltip()"
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
      type: Object,
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
    const size = ref(Math.min(
      chart.canvas.width - chart.canvas.x,
      chart.canvas.height - chart.canvas.y) / 2
    )

    const getStyle = computed(() => {
      return () => ({
        colors: ['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c'],
        innerRadius: 2,
        cornerRadius: 0,
        padAngle: 0.01,
        ...props.pieStyle
      })
    })

    const style = getStyle.value()
    const arcs = ref<Arc[]>([])
    const colors = scaleOrdinal(getStyle.value().colors)
    const arcGen = () => {
      return arc()
        .outerRadius(size.value)
        .innerRadius(style.innerRadius)
        .cornerRadius(style.cornerRadius)
        .padAngle(style.padAngle)
    }

    const transform = ref(`translate(${size.value + chart.canvas.x}, ${size.value + chart.canvas.y})`)

    let pieSort: any
    switch (props.sort) {
      case 'desc': pieSort = descending; break
      case 'asc': pieSort = ascending; break
      case 'none': pieSort = null; break
      case 'custom': pieSort = props.sortFunc ?? null; break
      default: pieSort = null
    }

    function updatePie() {
      // const key = chart.getKeys(1)
      const data = chart.getData([props.dataKeys[1]])
      arcs.value = pie().sort(pieSort)(data)
    }

    function getColor(index: number) {
      return colors(index.toString())
    }

    function showTooltip(event: MouseEvent, index: number) {
      mouse.hover = true
      mouse.index = index// - chart.data.length
      const [x, y] = pointer(event)
      mouse.position = { x: x + size.value, y: y + size.value }
    }

    function hideTooltip() {
      mouse.hover = false
      mouse.index = -1
    }

    function toKebabCase(data: any) {
      mapKeys(kebabize, data)
    }

    watch(chart.updates, () => {
      size.value = Math.min(
        chart.canvas.width - chart.canvas.x,
        (chart.canvas.height - chart.canvas.y) / 2
      )

      transform.value = `translate(${size.value + chart.canvas.x}, ${size.value + chart.canvas.y})`

      updatePie()
    })

    return {
      arcs,
      arcGen,
      getStyle,
      transform,
      getColor,
      hideTooltip,
      toKebabCase,
      showTooltip
    }
  }
})
</script>
