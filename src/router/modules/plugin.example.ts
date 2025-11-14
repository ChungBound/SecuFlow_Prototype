import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/plugin_example',
  component: Layout,
  redirect: '/plugin_example/qrcode',
  name: 'pluginExample',
  meta: {
    title: '插件',
    icon: 'i-clarity:plugin-outline-alerted',
  },
  children: [
    {
      path: 'hooksplus',
      name: 'pluginExampleHooksPlus',
      component: () => import('@/views/plugin_example/hooks.plus.vue'),
      meta: {
        title: 'VueHooks Plus',
        icon: 'https://inhiblabcore.github.io/docs/hooks/logo.svg',
      },
    },
    {
      path: 'print',
      name: 'pluginExamplePrint',
      component: () => import('@/views/plugin_example/print.vue'),
      meta: {
        title: '打印',
        icon: 'i-ri:printer-line',
      },
    },
    {
      path: 'chart',
      redirect: '/chart/echarts',
      name: 'pluginExampleChart',
      meta: {
        title: '图表',
        icon: 'i-ri:bar-chart-2-line',
      },
      children: [
        {
          path: 'echarts',
          name: 'pluginExampleChartEcharts',
          component: () => import('@/views/plugin_example/echarts.vue'),
          meta: {
            title: 'Echarts',
          },
        },
        {
          path: 'vchart',
          name: 'pluginExampleChartVchart',
          component: () => import('@/views/plugin_example/vchart.vue'),
          meta: {
            title: 'VChart',
          },
        },
        {
          path: 'g2plot',
          name: 'pluginExampleChartG2plot',
          component: () => import('@/views/plugin_example/g2plot.vue'),
          meta: {
            title: 'G2plot',
          },
        },
      ],
    },
    {
      path: 'file-preview',
      name: 'pluginExampleFilePreview',
      component: () => import('@/views/plugin_example/file-preview.vue'),
      meta: {
        title: '文件预览',
        icon: 'i-mdi:file-eye-outline',
      },
    },
  ],
}

export default routes
