<template>
  <div>
    <Chart class="test" :size="size" :data="data" :axis="axis" :margin="margin">
      <template #layers>
        <Bar
          :dataKeys="['name', 'avg']"
          :barStyle="{ fill: '#0096c7' }"
          :gap="0"
        />
      </template>
      <template #widgets>
        <Tooltip />
      </template>
    </Chart>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/runtime-core'
import * as mockup from '@/mockup'
import * as r from 'ramda'

export default defineComponent({
  setup() {
    const data = ref<any>(mockup.plByMonth)
    const margin = ref({
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    })

    const size = ref({
      width: 200,
      height: 200
    })

    const axis = ref({
      primary: {
        hide: true
      },
      secondary: {
        ticks: 4,
        hide: true
      }
    })

    return { data, axis, margin, size }
  }
})
</script>

<style>
.test svg {
  border: 1px solid red;
}
</style>
