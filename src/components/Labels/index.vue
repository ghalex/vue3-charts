<template>
  <Layer :dataKeys="dataKeys" type="custom">
    <text v-bind="toKebabCase(getStyle())">Some text</text>
  </Layer>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { is } from 'ramda'
import { usePoints } from '@/hooks'
import Layer from '../Layer/index.vue'
import { kebabize, mapKeys } from '@/utils'

export default defineComponent({
  name: 'Line',
  components: { Layer },
  props: {
    textStyle: {
      type: Object,
      required: false
    },
    dataKeys: {
      type: Object as () => [string, string],
      required: true
    }
  },
  setup(props) {
    const toKebabCase = (data: any) => mapKeys(kebabize, data)
    const { points } = usePoints(props.dataKeys, { stacked: false, type: 'custom' })

    const getStyle = computed(() => {
      if (is(Function, props.textStyle)) {
        return props.textStyle as () => any
      }

      return () => ({
        color: 'black',
        ...props.textStyle
      })
    })

    // watch(points, () => updateLine())
    // watch(chart.updates, () => updateLine())

    return { points, toKebabCase, getStyle }
  }
})
</script>
