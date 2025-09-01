import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  /* {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue')
  },
  {
    path: '/guests',
    name: 'Guests',
    component: () => import('../views/GuestsView.vue')
  },
  {
    path: '/rsvp',
    name: 'RSVP',
    component: () => import('../views/RSVPView.vue')
  },
  {
    path: '/communications',
    name: 'Communications',
    component: () => import('../views/CommunicationsView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue')
  } */
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
