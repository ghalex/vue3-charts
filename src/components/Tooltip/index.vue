<template>
  <div class="tooltip" :style="style" v-if="show">
    <div class="tooltip-content" :style="styleContent" ref="el">
      <slot :payload="items">
        <div :style="{ borderColor: color }">
          <div v-for="(item, i) in items" :key="i" :style="{ color: item.color }">
            <b>{{ item.label }}</b
            >: {{ item.valueFormatted }}
          </div>
        </div>
      </slot>
    </div>
    <div v-if="!hideLine">
      <div
        v-if="direction === 'horizontal'"
        class="tooltip-line-vertical"
        :style="{
          height: canvas.height + 'px'
        }"
      />
      <div
        v-else
        class="tooltip-line-horizontal"
        :style="{
          width: canvas.width - 40 + 'px'
        }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { format } from 'd3-format'
import { is } from 'ramda'
import { useChart, useTooltip } from '@/hooks'
import { Canvas } from '@/types'

export default defineComponent({
  name: 'Tooltip',
  components: {},
  props: {
    format: {
      type: String,
      default: ',.0f'
    },
    color: {
      type: String,
      default: '#7876ec'
    },
    hideLine: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: {}
    }
  },
  setup(props) {
    const el = ref(null)
    const chart = useChart()
    const canvas = ref<Canvas>(chart.canvas)
    const direction = ref(chart.config.direction)
    const { position, payload, show } = useTooltip()

    const isRight = computed(() => {
      return position.value.x >= (canvas.value.width / 4) * 3
    })

    const style = computed(() => {
      if (direction.value !== 'horizontal') {
        return {
          top: position.value.y - 0.5 + 'px',
          left: canvas.value.x + 'px'
        }
      }

      return {
        top: canvas.value.y + 'px',
        left: position.value.x - 0.5 + 'px'
      }
    })
    const styleContent = computed(() => {
      if (direction.value !== 'horizontal') {
        return {
          top: 5 + 'px',
          left: position.value.x - 30 + 'px'
        }
      }

      return {
        top: position.value.y + 'px',
        transform: `translateX(${isRight.value ? '-100%' : 0})`
      }
    })

    const formatValue = (val: any, formatter: any) => {
      return is(Function, formatter) ? formatter(val) : is(Number, val) ? format(formatter as string)(val) : val
    }

    const items = computed(() => {
      return Object.keys(payload.value)
        .map((key) => {
          const config = {
            ...{ label: key, format: props.format, color: props.color, hide: false },
            ...props.config[key]
          }

          return {
            key,
            label: config.label,
            value: payload.value[key],
            valueFormatted: formatValue(payload.value[key], config.format),
            color: config.color,
            hide: config.hide
          }
        })
        .filter((i) => !i.hide)
    })

    watch(chart.updates, () => {
      direction.value = chart.config.direction
      canvas.value = chart.canvas
    })

    return { el, show, canvas, direction, style, styleContent, position, items, isRight }
  }
})
</script>

<style scoped>
.tooltip {
  position: absolute;
  pointer-events: none;
}

.tooltip-content {
  position: absolute;
  white-space: nowrap;
  pointer-events: none;
}

.tooltip-content > div {
  margin-left: 5px;
  margin-right: 5px;
  border: 2px solid;
  background-color: white;
  padding: 8px;
  text-align: left;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.tooltip-right {
  transform: translateX(-100%);
  margin-left: 0;
}

.tooltip-line-vertical {
  top: 0px;
  position: absolute;
  width: 1px;
  background-color: black;
  pointer-events: none;
  opacity: 0.3;
}

.tooltip-line-horizontal {
  left: 0px;
  position: absolute;
  height: 1px;
  background-color: black;
  pointer-events: none;
  opacity: 0.3;
}
</style>
