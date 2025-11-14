// stores/projectVisualizationStore.ts
import { defineStore } from 'pinia'
import api from '@/api'

interface MatrixData {
  [email: string]: {
    [email: string]: number
  }
}
interface dev_info {
  email: string
  isSecurity: boolean
}

export const useProjectVisualizationStore = defineStore('projectVisualization', {
  state: () => ({
    projectId: '1',
    requirementsMatrix: {} as MatrixData,
    activitiesMatrix: {} as MatrixData,
    mcstcValue: 0,
    stcValue: 0,
    projectName: '',
    createTime: '',
    analystEmails: [] as dev_info[],
    dev_infos: [],
  }),
  actions: {
    setProjectId(id: string) {
      this.projectId = id
    },
    async fetchProjectData() {
      try {
        const response = await api.get(`/projects/${this.projectId}`)
        this.requirementsMatrix = response.cr_matrix
        this.activitiesMatrix = response.ca_matrix
        this.mcstcValue = response.mc_stc_value
        this.stcValue = response.stc_value
        this.projectName = response.project_name
        this.createTime = response.create_time
        this.dev_infos = response.dev_infos
        this.analystEmails = this.dev_infos
          .filter(dev => dev.isSecurity)
          .map(dev => dev.email)
        return true // 表示成功
      }
      catch (error) {
        console.error('Error fetching project data:', error)
        throw error // 向外抛出错误
      }
    },
    async getDevInfo() {
      try {
        const response = await api.get(`/projects/${this.projectId}/dev_infos`)
        this.dev_infos = response.dev_infos
        return true
      }
      catch (error) {
        console.error('Error fetching project data:', error)
        throw error // 向外抛出错误
      }
    },
  },
})
