import fs from 'node:fs'
import path from 'node:path'
import { defineFakeRoute } from 'vite-plugin-fake-server/client'
import Mock from 'mockjs'

// 模拟从文件读取矩阵数据
function readMatrixFromFile(filename) {
  const filePath = path.join(__dirname, filename)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(fileContent)
}

const caMatrix = readMatrixFromFile('mock-file/ca_matrix.json')
const crMatrix = readMatrixFromFile('mock-file/cr_matrix.json')

export default defineFakeRoute([
  {
    url: '/mock/overview/',
    method: 'get',
    response: () => {
      return {

        highRiskCount: Mock.Random.integer(0, 5),
        midRiskCount: Mock.Random.integer(0, 10),
        lowRiskCount: Mock.Random.integer(0, 15),
        totalRiskCount: Mock.Random.integer(15, 30),

      }
    },
  },
  {
    url: '/mock/projects',
    method: 'get',
    response: ({ query }) => {
      const { project_name, project_status } = query
      let projects = [
        {
          project_id: 1,
          project_name: 'test_repo',
          status: 'mid',
        },
        {
          project_id: 2,
          project_name: 'alpha_project',
          status: 'low',
        },
        {
          project_id: 3,
          project_name: 'beta_initiative',
          status: 'high',
        },
      ]

      if (project_name) {
        projects = projects.filter(p => p.project_name.includes(project_name))
      }
      if (project_status) {
        projects = projects.filter(p => p.status === project_status)
      }

      return {
        projects,
      }
    },
  },
  {
    url: '/mock/projects/:id',
    method: 'get',
    response: ({ params }) => {
      const id = Number.parseInt(params.id)
      const projectNames = ['test_repo', 'alpha_project', 'beta_initiative']
      return {
        project_id: id,
        project_name: projectNames[id - 1] || `Project ${id}`,
        ca_matrix: caMatrix,
        cr_matrix: crMatrix,
        coordination_date: Mock.Random.date('yyyy-MM-dd'),
        create_time: Mock.Random.datetime('yyyy-MM-ddTHH:mm:ss.SSSSSS'),
        mc_stc_value: Mock.Random.float(0, 1, 2, 4),
      }
    },
  },
])
