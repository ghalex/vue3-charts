import { computed, inject, ref } from 'vue'

export default (dataKey: string) => {
  const raw = inject('data', ref([]))
  const data = computed(() => {
    return raw.value.map((x) => x[dataKey])
  })

  return { data }
}
