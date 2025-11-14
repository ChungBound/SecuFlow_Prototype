// stores/projectStore.ts
// import { defineStore } from 'pinia'

export const useProjectStore = defineStore('project', {
  state: () => ({
    selectedStatus: 'all',
    projectName: '',
  }),
  actions: {
    setSelectedStatus(status: string) {
      this.selectedStatus = status
    },
    setProjectName(name: string) {
      this.projectName = name
    },
    resetFilters() {
      this.selectedStatus = 'all'
      this.projectName = ''
    },
  },
})
