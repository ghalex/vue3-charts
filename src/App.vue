<template>
  <h2>Charts here</h2>
  <Chart :width="400" :height="300" :data="data">
    <Bar dataKey="pv" />
    <XAxis />
  </Chart>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import data from '@/mockup/pages'

export default defineComponent({
  name: 'App',
  setup() {
    return { data }
  }
})
</script>

<style lang="scss">
@import './assets/main.css';
</style>
