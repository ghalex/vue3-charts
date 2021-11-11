<template>
  <Layer :dataKeys="dataKeys" type="pie">
    <text v-if="arcs.length === 0">No Data</text>
    <g :transform="transform" id="chart-group">
      <path v-for="(arc, i) in arcs" :key="i" :id="`arc-${i}`" class="chart-pie"
        v-bind="toKebabCase(getStyle())" :fill="getColor(i)" :d="arcGen(arc)"
        @mousemove="showTooltip($event, i)" @mouseleave="hideTooltip()"
      />
    </g>
  </Layer>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useMouse, useChart } from '@/hooks'
import Layer from '../Layer/index.vue'
import { Arc } from '@/types'
import { kebabize, mapKeys } from '@/utils'
import { pie, arc } from 'd3-shape'
import { scaleOrdinal } from 'd3-scale'
import { BaseType, pointer, select } from 'd3-selection'

export default defineComponent({
  name: 'Pie',
  components: { Layer },
  props: {
    pieStyle: {
      type: Object,
      required: false
    },
    dataKeys: {
      type: Object as () => [string, string],
      required: true
    }
  },
  setup(props) {
    const chart = useChart()
    const mouse = useMouse()

    const getStyle = computed(() => {
      return () => ({
        colors: ['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c'],
        innerRadius: 1,
        outerRadius: Math.min(chart.config.size.width, chart.config.size.height) / 2,
        cornerRadius: 0,
        padAngle: 0.01,
        ...props.pieStyle
      })
    })

    const style = getStyle.value()
    const arcs = ref<Arc[]>([])
    const colors = scaleOrdinal(getStyle.value().colors)
    const arcGen = arc()
      .outerRadius(style.outerRadius)
      .innerRadius(style.innerRadius)
      .cornerRadius(style.cornerRadius)
      .padAngle(style.padAngle)

    const transform = `translate(${style.outerRadius}, ${style.outerRadius})`

    function updatePie() {
      arcs.value = pie()(chart.getData(props.dataKeys))
    }

    function getColor(index: number) {
      return colors(index.toString())
    }

    let node: BaseType
    function getNode() {
      if (!node) {
        node = select('#chart-group').node()
      }
      return node
    }

    function showTooltip(event: MouseEvent, index: number) {
      mouse.hover = true
      mouse.index = index - chart.data.length
      const [x, y] = pointer(event, getNode())
      mouse.position = { x: x + style.outerRadius, y: y + style.outerRadius }
    }

    function hideTooltip() {
      mouse.hover = false
      mouse.index = -1
    }

    function toKebabCase(data: any) {
      mapKeys(kebabize, data)
    }

    watch(chart.updates, updatePie)

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
