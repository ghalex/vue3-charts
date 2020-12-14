<template>
  <div
    class="tooltip"
    :style="{
      top: canvas.y + 'px',
      left: pos.x + 4 + 'px'
    }"
    v-if="show"
  >
    <div
      class="tooltip-content"
      :style="{
        top: pos.y + 'px',
        transform: `translateX(${isRight ? '-100%' : 0})`,
        left: 5
      }"
      ref="el"
    >
      <div>
        <!-- <div><b>Page 1</b></div> -->
        <div v-for="(item, i) in items" :key="i" :style="{ color: item.color }">
          <b>{{ item.key }}</b
          >: {{ item.value }}
        </div>
      </div>
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
import { usePlane, useTooltip } from '@/hooks'

export default defineComponent({
  name: 'Tooltip',
  components: {},
  props: {},
  setup() {
    const el = ref(null)
    const { data, canvas } = usePlane()
    const { pos, payload, isMouseOver } = useTooltip()
    const show = computed(() => isMouseOver.value && data.value.length)

    const isRight = computed(() => {
      return pos.value.x >= canvas.value.width / 2
    })

    const width = computed(() => {
      return el.value?.offsetWidth || 0
    })

    const items = computed(() => {
      return Object.keys(payload.value).map((k) => {
        return payload.value[k]
      })
    })

    return { el, show, canvas, pos, items, width, isRight, isMouseOver }
  }
})
</script>

<style lang="scss">
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
}

.tooltip-right {
  transform: translateX(-100%);
  margin-left: 0;
}

.tooltip-line {
  top: 4px;
  position: absolute;
  width: 1px;
  background-color: black;
  pointer-events: none;
  opacity: 0.2;
}
</style>
