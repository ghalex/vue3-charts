<template>
  <div
    class="tooltip"
    :style="{
      top: canvas.y + 'px',
      left: position.x - 0.5 + 'px'
    }"
    v-if="show"
  >
    <div
      class="tooltip-content"
      :style="{
        top: position.y + 'px',
        transform: `translateX(${isRight ? '-100%' : 0})`,
        left: 5
      }"
      ref="el"
    >
      <slot :payload="items">
        <div>
          <div v-for="(item, i) in items" :key="i" :style="{ color: item.color }">
            <b>{{ item.key }}</b
            >: {{ formatNumber(item.value) }}
          </div>
        </div>
      </slot>
    </div>
    <div
      class="tooltip-line"
      :style="{
        height: canvas.height + 'px'
      }"
    />
  </div>
</template>

<script>
import { computed, defineComponent, ref } from 'vue'
import { usePlane, useTooltip } from '@/lib/hooks'
import { format } from 'd3-format'

export default defineComponent({
  name: 'Tooltip',
  components: {},
  props: {
    format: {
      type: String,
      default: '(0,.0f'
    }
  },
  setup(props) {
    const el = ref(null)
    const { data, canvas, isMouseOver } = usePlane()
    const { position, payload } = useTooltip()
    const show = computed(() => isMouseOver.value && payload.value && data.value.length)
    const formatNumber = computed(() => format(props.format))

    const isRight = computed(() => {
      return position.value.x >= (canvas.value.width / 4) * 3
    })

    const items = computed(() => {
      return Object.keys(payload.value).map((k) => {
        return payload.value[k]
      })
    })

    return { el, show, canvas, formatNumber, position, items, isRight }
  }
})
</script>

<style scoped lang="scss">
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
  border: 2px solid #7876ec;
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

.tooltip-line {
  top: 0px;
  position: absolute;
  width: 1px;
  background-color: black;
  pointer-events: none;
  opacity: 0.3;
}
</style>
