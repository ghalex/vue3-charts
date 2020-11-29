<template>
  <div>bar</div>
</template>

<script>
import { defineComponent, inject, ref, watch } from 'vue'
import { useData, useScales } from '@/hooks'

export default defineComponent({
  name: 'Bar',
  props: {
    dataKey: {
      type: String,
      default: 'value'
    }
  },
  setup(props) {
    const { data } = useData(props.dataKey)
    const { xScale, yScale } = useScales()

    watch(
      data,
      () => {
        console.log(data.value)
      },
      { immediate: true }
    )
  }
})
</script>

<style></style>
