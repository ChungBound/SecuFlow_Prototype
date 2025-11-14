import { setupLayouts } from 'virtual:meta-layouts'
import generatedRoutes from 'virtual:generated-pages'
import type { RouteRecordRaw } from 'vue-router'
import type { Route } from '#/global'
import useSettingsStore from '@/store/modules/settings'
import overview from '@/router/modules/overview.ts'
import projects from '@/router/modules/projects.ts'
import statistics from '@/router/modules/statistics.ts'
// 固定路由（默认路由）
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/newLogin.vue'),
    meta: {
      title: 'Login',
    },
  },
  // {
  //   path: '/newlogin',
  //   name: 'newlogin',
  //   component: () => import('@/views/newLogin.vue'),
  //   meta: {
  //     title: 'newLogin',
  //   },
  // },
  {
    path: '/:all(.*)*',
    name: 'notFound',
    component: () => import('@/views/[...all].vue'),
    meta: {
      title: 'notFound',
    },
  },
]

// 系统路由
const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    redirect: '/overview',
    meta: {
      title: () => useSettingsStore().settings.home.title,
      breadcrumb: false,
    },
    children: [
      // secuflow,
      // {
      //   path: '',
      //   component: () => import('@/views/secuFlow/overview.vue'),
      //   meta: {
      //     title: () => useSettingsStore().settings.home.title,
      //     icon: 'i-ant-design:home-twotone',
      //     breadcrumb: false,
      //   },
      // },
      {
        path: 'reload',
        name: 'reload',
        component: () => import('@/views/reload.vue'),
        meta: {
          title: 'Reload',
          breadcrumb: false,
        },
      },
    ],
  },
]

// 动态路由（异步路由、导航栏路由）
const asyncRoutes: Route.recordMainRaw[] = [
  {
    meta: {
      title: 'Overview',
      icon: 'i-uim:box',
    },
    children: [
      overview,
      // secuflow,
    ],
  },
  {
    meta: {
      title: 'Projects',
      icon: 'i-fa:list-alt',
    },
    children: [
      // secuflow,
      projects,
    ],
  },
  {
    meta: {
      title: 'Statistics',
      icon: 'i-covid:graph-infected-increasing',
    },
    children: [
      statistics,
    ],
  },
]

const constantRoutesByFilesystem = generatedRoutes.filter((item) => {
  return item.meta?.enabled !== false && item.meta?.constant === true
})

const asyncRoutesByFilesystem = setupLayouts(generatedRoutes.filter((item) => {
  return item.meta?.enabled !== false && item.meta?.constant !== true && item.meta?.layout !== false
}))

export {
  constantRoutes,
  systemRoutes,
  asyncRoutes,
  constantRoutesByFilesystem,
  asyncRoutesByFilesystem,
}
