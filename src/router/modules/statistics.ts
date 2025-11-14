import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/statistics',
  component: Layout,
  name: 'statisticsLayout',
  meta: {
    title: 'secuFlow',
    // icon: 'i-ri:database-2-line',
  },
  children: [
    {
      path: '',
      name: 'statistics',
      component: () => import('@/views/secuFlow/statistic.vue'),
      meta: {
        title: 'Statistics',
        breadcrumb: false,
      },
    },
    {
      path: 'temp',
      name: 'temp',
      component: () => import('@/views/secuFlow/vis.example.vue'),
      meta: {
        title: 'temp',
        breadcrumb: false,
      },
    },
  ],
}

export default routes
