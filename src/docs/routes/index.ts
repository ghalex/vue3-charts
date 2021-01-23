import { createRouter, createWebHistory } from 'vue-router'
import * as pages from '@/docs/pages'

const routes = [
  {
    path: '/',
    name: 'home',
    component: pages.HomePage
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
