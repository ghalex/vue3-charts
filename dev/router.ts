import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { Main, Single } from './pages'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Main',
    component: Main
  }, {
    path: '/single',
    name: 'Single',
    component: Single
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
