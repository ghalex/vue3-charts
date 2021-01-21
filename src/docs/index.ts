import { createApp } from 'vue'
import App from './App.vue'
import * as components from '@/lib/components'

const app = createApp(App)

Object.keys(components).forEach((name) => {
  const Component = (components as any)[name]
  app.component(name, Component)
})

app.mount('#app')
