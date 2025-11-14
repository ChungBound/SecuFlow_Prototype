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
  totalProjects: 0,
  highRiskProjects: 0,
  mediumRiskProjects: 0,
  lowRiskProjects: 0,
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
        <h1 class="title">
          Project Risk Overview Dashboard
        </h1>
      </div>

      <div class="risk-summary">
        <!-- Project Count -->
        <div class="card project-card project-count" @click="clickProject('all')">
          <div class="card-content">
            <div class="text-container">
              <div class="card-number">
                {{ projectData.totalProjects }}
              </div>
              <div class="card-title">
                Project Count
              </div>
            </div>
            <img class="arrow-icon" src="../../assets/images/down-right-arrow.png" alt="arrow">
          </div>
          <div class="card-description">
            Total number of projects.
          </div>
        </div>

        <!-- Low Risk Project -->
        <div class="card project-card low-risk" @click="clickProject('low')">
          <div class="card-content">
            <div class="text-container">
              <div class="card-number">
                {{ projectData.lowRiskProjects }}
              </div>
              <div class="card-title">
                Low Risk <br>
                Project
              </div>
            </div>
            <img class="arrow-icon" src="../../assets/images/down-right-arrow.png" alt="arrow">
          </div>
          <div class="card-description">
            Low Risk MC-STC Range:0.76-1
          </div>
        </div>

        <!-- Medium Risk Project -->
        <div class="card project-card medium-risk" @click="clickProject('mid')">
          <div class="card-content">
            <div class="text-container">
              <div class="card-number">
                {{ projectData.mediumRiskProjects }}
              </div>
              <div class="card-title">
                Medium Risk <br>
                Project
              </div>
            </div>
            <img class="arrow-icon" src="../../assets/images/down-right-arrow.png" alt="arrow">
          </div>
          <div class="card-description">
            Medium Risk MC-STC Range: 0.26-0.75
          </div>
        </div>

        <!-- High Risk Project -->
        <div class="card project-card high-risk" @click="clickProject('high')">
          <div class="card-content">
            <div class="text-container">
              <div class="card-number">
                {{ projectData.highRiskProjects }}
              </div>
              <div class="card-title">
                High Risk <br>
                Project
              </div>
            </div>
            <img class="arrow-icon" src="../../assets/images/down-right-arrow.png" alt="arrow">
          </div>
          <div class="card-description">
            High Risk MC-STC Range: 0-0.25
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
}

.overview-container {
  position: relative;
  padding: 50px;
}

.transparent-bg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  background-color: rgb(255 255 255 / 20%);
  border-radius: 12px;
}

.header {
  position: relative;
  z-index: 2;
  margin-left: 10px; /* 与卡片左对齐的margin值 */
  text-align: left; /* 确保标题左对齐 */
}

h1 {
  margin: 0;
  font-family: "Alibaba Sans", sans-serif;
  font-size: 5vh;
  font-weight: 900;
}

.risk-summary {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 10px; /* 间距 */
  justify-content: space-between;
  margin: 0 auto;
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 30vw;
  height: 53vh;
  padding: 20px;
  margin: 30px 10px;
  color: white;
  text-align: center;
  cursor: pointer;
  border-radius: 5px;
  box-shadow: rgb(60 64 67 / 30%) 0 1px 2px 0, rgb(60 64 67 / 30%) 0 2px 6px 2px;
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* 添加平滑过渡效果 */
}

.project-count:hover {
  box-shadow: rgb(14 193 155 / 60%) 0 6px 18px 3px, rgb(14 193 155 / 40%) 0 8px 24px 6px; /* 根据低风险卡片颜色调整阴影 */
  transform: scale(1.05);
}

.low-risk:hover {
  box-shadow: rgb(14 193 155 / 60%) 0 6px 18px 3px, rgb(14 193 155 / 40%) 0 8px 24px 6px; /* 根据低风险卡片颜色调整阴影 */
  transform: scale(1.05);
}

.medium-risk:hover {
  box-shadow: rgb(255 180 32 / 60%) 0 6px 18px 3px, rgb(255 180 32 / 40%) 0 8px 24px 6px; /* 根据中风险卡片颜色调整阴影 */
  transform: scale(1.05);
}

.high-risk:hover {
  box-shadow: rgb(218 67 99 / 60%) 0 6px 18px 3px, rgb(218 67 99 / 40%) 0 8px 24px 6px; /* 根据高风险卡片颜色调整阴影 */
  transform: scale(1.05);
}

.card-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-right: 15px;
  margin-top: 10px;
}

.text-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.card-number {
  margin-bottom: 5px;
  font-family: "Alibaba Sans", sans-serif;
  font-size: 7rem;
  font-weight: 900;
  line-height: 100px;
}

.card-title {
  margin-bottom: 5px;
  margin-left: 10px;
  font-family: "Alibaba Sans", sans-serif;
  font-size: 2rem;
  font-weight: 700;
  line-height: 30px;
  text-align: left;
}

.arrow-icon {
  width: 32px;
  height: 32px;
  margin-top: 85px; /* Arrow aligns with "Low Risk Project" */
}

@media (width >= 1920px) and (height >= 1080px) {
  .header {
    position: relative;
    margin-top: 100px;
    text-align: left; /* 确保标题左对齐 */
  }

  .card {
    width: 23%; /* 更大视口下的卡片宽度 */
    height: 50vh; /* 更大视口下的卡片高度 */
  }

  .project-count:hover {
    box-shadow: rgb(14 193 155 / 60%) 0 6px 34px 12px, rgb(14 193 155 / 40%) 0 8px 48px 20px; /* 根据低风险卡片颜色调整阴影 */
    transform: scale(1.05);
  }

  .low-risk:hover {
    box-shadow: rgb(14 193 155 / 60%) 0 6px 34px 12px, rgb(14 193 155 / 40%) 0 8px 48px 20px; /* 根据低风险卡片颜色调整阴影 */
    transform: scale(1.05);
  }

  .medium-risk:hover {
    box-shadow: rgb(255 180 32 / 60%) 0 6px 34px 12px, rgb(255 180 32 / 40%) 0 8px 48px 20px; /* 根据中风险卡片颜色调整阴影 */
    transform: scale(1.05);
  }

  .high-risk:hover {
    box-shadow: rgb(218 67 99 / 60%) 0 6px 34px 12px, rgb(218 67 99 / 40%) 0 8px 48px 20px; /* 根据高风险卡片颜色调整阴影 */
    transform: scale(1.05);
  }

  .card-number {
    font-size: 8rem; /* 增大字体 */
  }

  .card-title {
    margin-top: 50px;
    font-size: 2.5rem;
    line-height: 1; /* 增大标题字体 */
  }

  .arrow-icon {
    width: 40px; /* 增大箭头图标 */
    height: 40px;
  }

  .card-content {
    flex-direction: row; /* 改变内容布局为横向 */
    justify-content: space-between;
  }
}

.card-description {
  font-family: "Alibaba Sans", sans-serif;
  font-size: 1.2rem;
  line-height: 1.2rem;
}

/* Background colors for the cards */
.project-count {
  background-color: rgb(0 0 0 / 80%); /* 80%透明度黑色 */
}

.low-risk {
  background-color: rgb(14 193 155 / 60%); /* 60%透明度的#0ec19b */
}

.medium-risk {
  background-color: rgb(255 180 32 / 60%); /* 60%透明度的#ffb420 */
}

.high-risk {
  background-color: rgb(218 67 99 / 80%); /* 80%透明度的#da4363 */
}
</style>
