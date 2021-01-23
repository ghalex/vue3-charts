<template>
  <div class="home-layout">
    <Navbar />
    <div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Navbar } from '@/docs/components'
export default {
  name: 'MainLayout',
  components: { Navbar }
}
</script>

<style lang="postcss" scoped>
.home-layout {
  border: 1px solid red;
}
</style>
