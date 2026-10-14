<script lang="ts">
import { defineComponent, provide } from 'vue'

// Renderless: a `<div>` (or any non-SVG element) inside `<svg>` is created in
// the SVG namespace and browsers do not render it or its children.
export default defineComponent({
  name: 'Group',
  props: {
    stacked: {
      type: Boolean,
      default: false
    },
    maxWidth: {
      type: Number,
      default: -1
    }
  },
  setup(props, { slots }) {
    provide('layerProps', props)
    return () => slots.default?.()
  }
})
</script>
