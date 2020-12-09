<template>
  <h2>Charts here</h2>
  <Chart :width="400" :height="350" :data="data" :margin="margin">
    <Line dataKey="pv" fill="red" />
    <Area dataKey="pv" fill="blue" />
    <Line dataKey="uv" stroke="red" />
    <XAxis />
    <YAxis />
  </Chart>

  <div>
    <button @click="setData">Click Me</button>
  </div>
  <Chart :width="400" :height="300" :data="data" :margin="margin">
    <Bar dataKey="uv" fill="#82ca9d" />
    <Bar dataKey="pv" fill="#8884d8" />
    <Line dataKey="uv" stroke="purple" />
    <XAxis />
    <YAxis />
  </Chart>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import mockupData from '@/mockup/pages'

export default defineComponent({
  name: 'App',
  setup() {
    const margin = { top: 0, right: 0, bottom: 0, left: 0 }
    const data = ref([] as any[])

    function setData() {
      console.log('set new data')
      data.value = mockupData
    }

    return { data, margin, setData }
  }
})
</script>

<style lang="scss">
@import './assets/main.css';
</style>
