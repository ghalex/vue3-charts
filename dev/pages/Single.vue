<template>
  <div>
    <Responsive class="w-full">
      <template #main="{ width }">
        <Chart
            class="chart"
            direction="circular"
            :data="data"
            :config="{ controlHover: false }"
            :margin="margin"
            :axis="{ primary: { hide: true }, secondary: { hide: true }}"
            :size="{ width, height: 400 }"
          >
            <template #layers>
              <Pie :dataKeys="['name', 'avg']" :pie-style="{ innerRadius: 50, padAngle: 0.05 }" />
              <!-- </Group> -->
            </template>
            <template #widgets>
              <Tooltip color="red" hideLine />
            </template>
          </Chart>
      </template>
    </Responsive>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/runtime-core'
import * as mockup from '@/mockup'

export default defineComponent({
  setup() {
    const data = ref<any>(mockup.plByMonth)
    const margin = ref({
      left: 150,
      top: 10,
      right: 10,
      bottom: 10
    })

    return { data, margin }
  }
})
</script>

<style>
.chart svg {
  border: 1px solid red;
}
</style>
