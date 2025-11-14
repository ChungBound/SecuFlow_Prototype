<route lang="yaml">
  meta:
    title: 页面标题
  </route>

<script setup lang="ts">
import { reactive } from 'vue'
// import { useRouter } from 'vue-router'
import api from '@/api'
import { useProjectStore } from '@/store/modules/projectStore'

defineOptions({
  name: 'SecuFlowOverview',
})

const projectStore = useProjectStore()

const router = useRouter()

const projectData = reactive({
  totalProjects: 12,
  highRiskProjects: 8,
  mediumRiskProjects: 2,
  lowRiskProjects: 2,
  highRiskDescription: '0 - 0.25',
  mediumRiskDescription: '0.26 - 0.75',
  lowRiskDescription: '0.76 - 1.0',
})

// GET 请求
api.get('overview/').then((res) => {
  console.log(res)
  projectData.totalProjects = res.totalRiskCount
  projectData.highRiskProjects = res.highRiskCount
  projectData.mediumRiskProjects = res.midRiskCount
  projectData.lowRiskProjects = res.lowRiskCount

  // 后续业务代码
})

function clickProject(level) {
  projectStore.setSelectedStatus(level)
  router.push({
    name: 'projects',
  })
}
</script>

<template>
  <div class="bg-banner">
    <div class="overview-container">
      <div class="transparent-bg" />
      <div class="header">
        <h1>Overview of Projects</h1>
      </div>

      <div class="risk-summary">
        <div class="project-summary">
          <div class="card project-card" @click="clickProject('all')">
            <div class="card-content">
              <div class="card-title">
                PROJECT COUNT
              </div>
              <div class="card-number">
                {{ projectData.totalProjects }}
              </div>
            </div>
          </div>
          <div class="card low-risk project-card" @click="clickProject('low')">
            <div class="card-content">
              <div class="card-title">
                LOW - RISK
              </div>
              <div class="card-number">
                {{ projectData.lowRiskProjects }}
              </div>
            </div>
            <div class="card-value">
              MC-STC VALUE => {{ projectData.lowRiskDescription }}
            </div>
          </div>
          <div class="card medium-risk project-card" @click="clickProject('mid')">
            <div class="card-content">
              <div class="card-title">
                MEDIUM - RISK
              </div>
              <div class="card-number">
                {{ projectData.mediumRiskProjects }}
              </div>
            </div>
            <div class="card-value">
              MC-STC VALUE => {{ projectData.mediumRiskDescription }}
            </div>
          </div>
          <div class="card high-risk project-card" @click="clickProject('high')">
            <div class="card-content">
              <div class="card-title">
                HIGH - RISK
              </div>
              <div class="card-number">
                {{ projectData.highRiskProjects }}
              </div>
            </div>
            <div class="card-value">
              MC-STC VALUE => {{ projectData.highRiskDescription }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

  <style scoped>
  .bg-banner {
    width: 100%;
    height: 100%;
    background: url("../../assets/images/login-background.svg") no-repeat center center fixed;
  }

  .overview-container {
    padding: 20px;
  }

  .header h1 {
    margin-bottom: 20px;
    font-size: 30px;
    text-align: center;
  }

  .risk-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .project-summary {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
  }

  .card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 220px;
    height: 100px;
    margin: 10px;
    color: white;
    text-align: left;
    cursor: pointer;
    background-color: #52b6b9;
    border-radius: 8px;
    transition: box-shadow 0.3s ease;
  }

  .card:hover {
    box-shadow: rgb(0 0 0 / 30%) 0 4px 12px 0; /* 更深的阴影效果 */
  }

  .low-risk {
    background-color: #ffb2c0;
  }

  .medium-risk {
    background-color: #ff8ba0;
  }

  .high-risk {
    background-color: #ff3e61;
  }

  .card-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 5px;
  }

  .card-title {
    font-size: 22px;
    font-weight: bold;
    line-height: 1;
    text-align: left;
  }

  .card-number {
    display: flex;
    align-items: center;
    padding: 0 5px;
    margin-left: auto;
    font-size: 48px;
    font-weight: bold;
    line-height: 1;
  }

  .card-value {
    width: 100%;
    padding-left: 5px;
    margin-top: 2px;
    font-size: 10px;
    line-height: 1.2;
    text-align: left;
  }
  </style>
