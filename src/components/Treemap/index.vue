<template>
  <div class="treemap" :style="{ display: 'flex', position: 'relative' }">
    <svg :width="size.width" :height="size.height" :viewBox="`0 0 ${size.width} ${size.height}`" ref="el">
      <g class="layer-rectangles">
        <g
          v-for="(r, i) in rectangles"
          class="rectangle"
          :key="i"
          :class="{ selected: selected === i }"
          :transform="`translate(${r.x0}, ${r.y0})`"
          @mouseover="() => onMouseOver(i)"
          @mouseleave="onMouseOut"
        >
          <slot :r="r" :selected="selected === i">
            <rect v-bind="toKebabCase(getStyle(r))" :x="0" :y="0" :width="r.width" :height="r.height" />
            <slot :r="r" :selected="selected === i" name="text">
              <text :x="0 + 10" :y="0 + 20" :font-size="`15px`" :fill="`white`" font-weight="bold">
                {{ r.data.name }}
              </text>
            </slot>
          </slot>
        </g>
      </g>
    </svg>
    <slot name="widgets" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { scaleLinear, scaleSequential } from 'd3-scale'
import { stratify, treemap } from 'd3-hierarchy'
import { interpolateHcl } from 'd3-interpolate'
import { Margin, Size } from '@/types'
import { extent } from 'd3-array'
import { kebabize, mapKeys } from '@/utils'

export default defineComponent({
  name: 'Treemap',
  props: {
    size: {
      type: Object as () => Size,
      default: () => ({ width: 500, height: 400 }),
      required: false
    },
    margin: {
      type: Object as () => Margin,
      default: () => ({ top: 0, right: 0, bottom: 0, left: 0 })
    },
    padding: {
      type: Number,
      default: 8
    },
    data: {
      type: Array as () => any[],
      default: () => ([])
    },
    dataKeys: {
      type: Object as () => [string, string],
      required: true
    },
    colorFn: {
      type: Function,
      default: () => interpolateHcl('#60c96e', '#6b46c1')
    },
    rcStyle: {
      type: Function,
      required: false
    }
  },
  setup(props) {
    const el = ref(null)
    const data = ref(props.data)
    const selected = ref(null)
    const canvas = ref({
      x: props.margin.left,
      y: props.margin.top,
      width: props.size.width - props.margin.right,
      height: props.size.height - props.margin.bottom
    })

    const rectangles = ref<any>([])

    function getScales() {
      const values = extent(data.value.map((d) => d[props.dataKeys[1]])) as [number, number]

      const x = scaleLinear()
        .domain(values)
        .range([0, 100])
        .nice()

      const y = scaleSequential()
        .domain(values)
        .interpolator(props.colorFn())

      return { x, y }
    }

    function buildRectangles() {
      const { y } = getScales()
      const res = buildTree(data.value)
        .leaves()
        .map((d: any, idx: number) => {
          return {
            idx,
            x0: canvas.value.x + d.x0,
            x1: canvas.value.x + d.x1,
            y0: canvas.value.y + d.y0,
            y1: canvas.value.y + d.y1,
            width: d.x1 - d.x0,
            height: d.y1 - d.y0,
            data: d.data,
            color: y(d.value) // props.color
          }
        })

      return res
    }

    function buildTree(data: any) {
      const { x } = getScales()
      const createTreeMap = treemap()
        .size([canvas.value.width - canvas.value.x, canvas.value.height - canvas.value.y])
        .padding(props.padding)

      const treeFn = stratify()
        .id((d: any) => d.name)
        .parentId((d: any) => d.parent)

      const tree = treeFn(
        [{ name: 'root' }].concat(
          data.map((x: any) => {
            return {
              name: x[props.dataKeys[0]],
              value: x[props.dataKeys[1]],
              parent: 'root'
            }
          })
        )
      )

      tree.sum((d: any) => x(d.value))
      createTreeMap(tree)

      return tree
    }

    const toKebabCase = (data: any) => mapKeys(kebabize, data)
    const getStyle = (r: any) => {
      const style = {
        stroke: r.color,
        strokeWidth: 5,
        fill: r.color,
        fillOpacity: 0.9
      }

      if (props.rcStyle && typeof props.rcStyle === 'function') {
        return {
          ...style,
          ...props.rcStyle(r)
        }
      }

      return style
    }

    function onMouseOver(i: any) {
      // console.log('hover', i)
      selected.value = i
    }

    function onMouseOut() {
      selected.value = null
    }

    watch(
      props,
      () => {
        data.value = props.data
        canvas.value = {
          x: props.margin.left,
          y: props.margin.top,
          width: props.size.width - props.margin.right,
          height: props.size.height - props.margin.bottom
        }
        rectangles.value = buildRectangles()
      },
      { immediate: true }
    )

    return { el, rectangles, selected, getStyle, toKebabCase, onMouseOver, onMouseOut }
  }
})
</script>
