<route lang="yaml">
meta:
  title: 页面标题
</route>

<script setup lang="ts">
import api from '@/api'
defineOptions({
  name: 'ProjectlistExampleProjectExample',
})

// GET 请求
api.get('projects/', {
  params: {
    project_name: '',
    status: '',
  },
}).then((res) => {
  // 后续业务代码
  console.log(res)
})
</script>

<template>
  <div>
    <!-- 布局 -->
  </div>
</template>

<style scoped>
/* 样式 */
</style>
