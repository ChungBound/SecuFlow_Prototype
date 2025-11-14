import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/overview',
  component: Layout,
  name: 'overviewLayout',
  meta: {
    title: 'overview',
    // icon: 'i-ri:database-2-line',
  },
  children: [
    {
      path: '',
      name: 'overview',
      component: () => import('@/views/secuFlow/overview.vue'),
      meta: {
        title: 'Overview',
      },
    },
  ],
}

export default routes
