<template>
  <Layer :dataKeys="dataKeys" type="bar">
    <text v-if="bars.length === 0">No Data</text>
    <rect
      v-for="(bar, i) in bars"
      class="chart-bar"
      v-bind="
        toKebabCase(getStyle({ ...bar.props, active: i === mouse.index }))
      "
      :key="i"
      :x="bar.x"
      :y="bar.y"
      :width="bar.width > 0 ? bar.width : 0"
      :height="bar.height > 0 ? bar.height : 0"
      @click="() => onBarClick(bar, i)"
    />
    <rect
      v-if="selectedBar"
      class="chart-bar"
      v-bind="
        toKebabCase(getStyleSelected({ ...selectedBar.props }))
      "
      :x="selectedBar.x"
      :y="selectedBar.y"
      :width="selectedBar.width > 0 ? selectedBar.width : 0"
      :height="selectedBar.height > 0 ? selectedBar.height : 0"
    />
  </Layer>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue'
import { useBars, useMouse } from '@/hooks'
import { is } from 'ramda'
import Layer from '../Layer/index.vue'
import { kebabize, mapKeys } from '@/utils'

export default defineComponent({
  name: 'Bar',
  components: { Layer },
  props: {
    selectedBar: {
      type: Object,
      default: () => null
    },
    barStyle: {
      type: [Function, Object],
      default: () => ({
        fill: 'blue'
      })
    },
    barStyleSelected: {
      type: [Function, Object],
      default: () => ({
        fill: 'darkblue'
      })
    },
    maxWidth: {
      type: Number,
      default: -1
    },
    dataKeys: {
      type: Object as () => [string, string],
      required: true
    },
    gap: {
      type: Number,
      default: 5
    }
  },
  setup(props, { emit }) {
    const mouse = useMouse()
    const { stacked, maxWidth } = inject('layerProps', {
      stacked: false,
      maxWidth: -1
    })
    const { bars } = useBars(props.dataKeys, {
      maxWidth: Math.max(props.maxWidth, maxWidth),
      stacked,
      gap: props.gap,
      type: 'bar'
    })

    const getStyle = computed(() => {
      if (is(Function, props.barStyle)) {
        return props.barStyle
      }

      return () => props.barStyle
    })

    const getStyleSelected = computed(() => {
      if (is(Function, props.barStyleSelected)) {
        return props.barStyleSelected
      }

      return () => props.barStyleSelected
    })

    const toKebabCase = (data: any) => mapKeys(kebabize, data)

    function onBarClick(bar: any, idx: number) {
      emit('barClick', { ...bar, idx })
    }

    return { getStyle, getStyleSelected, toKebabCase, bars, mouse, onBarClick }
  }
})
</script>
