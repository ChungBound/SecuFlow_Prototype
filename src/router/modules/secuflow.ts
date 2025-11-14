import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/secuFlow',
  component: Layout,
  redirect: '/secuFlow/overview',
  name: 'overview',
  meta: {
    title: 'secuFlow',
    // icon: 'i-ri:database-2-line',
  },
  children: [
    {
      path: 'overview',
      name: 'overviewIndex',
      component: () => import('@/views/secuFlow/overview.vue'),
      meta: {
        title: 'Overview',
        breadcrumb: false,
      },
    },
    {
      path: 'projectList',
      name: 'projectList',
      component: () => import('@/views/secuFlow/project.list.vue'),
      meta: {
        title: 'projectList',
        breadcrumb: false,
        activeMenu: '/projectList',
      },
    },
    {
      path: 'projectExample',
      name: 'projectExmaple',
      component: () => import('@/views/projectlist_example/project.example.vue'),
      meta: {
        title: 'projectExmaple',
        breadcrumb: false,
      },
    },
    {
      path: 'vis',
      name: 'vis',
      component: () => import('@/views/secuFlow/vis.example.vue'),
      meta: {
        title: 'vis',
        breadcrumb: false,
      },
    },
  ],
}

export default routes
