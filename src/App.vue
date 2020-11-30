<template>
  <h2>Charts here</h2>
  <Chart :width="400" :height="300" :data="data" :margin="margin">
    <Area dataKey="pv" fill="red" />
    <Line dataKey="pv" />
    <Line dataKey="uv" stroke="#82ca9d" />
  </Chart>

  <Chart :width="400" :height="300" :data="data" :margin="margin">
    <Bar dataKey="uv" fill="#82ca9d" />
    <Bar dataKey="pv" fill="#8884d8" />
    <Line dataKey="uv" />
  </Chart>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import data from '@/mockup/pages'

export default defineComponent({
  name: 'App',
  setup() {
    const margin = { top: 10, right: 0, bottom: 10, left: 0 }
    return { data, margin }
  }
})
</script>

<style lang="scss">
@import './assets/main.css';
</style>
