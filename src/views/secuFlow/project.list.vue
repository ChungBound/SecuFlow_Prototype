<route lang="yaml">
meta:
  title: SecuFlow Project List
</route>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import api from '@/api'
import { useProjectStore } from '@/store/modules/projectStore.ts'
import { useProjectVisualizationStore } from '@/store/modules/projectVisualizationStore.ts'

defineOptions({
  name: 'SecuFlowProjectList',
})
interface Contributor {
  email: string
  isSecurity: boolean
}

const router = useRouter()
// store project and projectVisualizationStore data
const projectStore = useProjectStore()
const projectVisualizationStore = useProjectVisualizationStore()

// Define table data and search forms
const rawTableData = ref([])
const tableData = computed(() => {
  return rawTableData.value.map(item => ({
    ...item,
    displayStatus: transformStatus(item.status),
  }))
})
const searchForm = ref({
  projectName: projectStore.projectName,
  status: projectStore.selectedStatus,
})

// the back-end API
const apiUrl = 'projects/'

const contributors = ref<Contributor[]>([])
// const selectedContributors = ref([])
const showContributorModal = ref(false)

async function handleView(row: any) {
  try {
    projectVisualizationStore.setProjectId(row.project_id)
    const success = await projectVisualizationStore.getDevInfo()
    if (success) {
      contributors.value = projectVisualizationStore.dev_infos
      showContributorModal.value = true
    }
    else {
      throw new Error('Failed to fetch project data')
    }
  }
  catch (error) {
    console.error('Error fetching contributors:', error)
    ElMessage.error('Failed to fetch contributors')
  }
}

async function updateDevInfos() {
  const loading = ElLoading.service({
    lock: true,
    text: 'MC-STC value calculating...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    await api.post(`projects/${projectVisualizationStore.projectId}/dev_infos`, {
      dev_infos: contributors.value,
    })
    ElMessage.success('MC-STC values calculated successfully')
    showContributorModal.value = false
    router.push({ name: 'statistics' })
  }
  catch (error) {
    console.error('Error updating dev infos:', error)
    ElMessage.error('Failed to calculate MC-STC values')
  }
  finally {
    loading.close()
  }
}

// Fetch data
async function fetchData(filters: any = {}) {
  try {
    // Send search criteria to the back end
    const response = await api.get(apiUrl, {
      params: filters,
    })
    rawTableData.value = response
  }
  catch (error) {
    console.error('Error fetching project data:', error)
  }
}

// Handler when the search button is clicked
function handleSearch() {
  projectStore.setSelectedStatus(searchForm.value.status)
  projectStore.setProjectName(searchForm.value.projectName)
  const filters = {
    project_name: searchForm.value.projectName,
    status: searchForm.value.status !== 'all' ? searchForm.value.status : undefined,
  }
  fetchData(filters)
}

// Reset Form
function handleReset() {
  projectStore.resetFilters()
  searchForm.value = {
    projectName: '',
    status: 'all',
  }
  fetchData() // Get all project data after reset
}

watch(() => projectStore.selectedStatus, (newStatus) => {
  searchForm.value.status = newStatus
  handleSearch()
})

watch(() => projectStore.projectName, (newName) => {
  searchForm.value.projectName = newName
  handleSearch()
})

// Get all data at initialization
onMounted(() => {
  fetchData({
    project_name: projectStore.projectName,
    status: projectStore.selectedStatus !== 'all' ? projectStore.selectedStatus : undefined,
  })
})

// Handle button clicks
// const router = useRouter()
// function handleView(row: any) {
//   // ElMessage.success(`Viewing project id: ${row.project_id}`)
//   projectVisualizationStore.setProjectId(row.project_id)
//   router.push({ name: 'statistics' })
// }

// Function to transform status
function transformStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    high: 'High Risk',
    mid: 'Medium Risk',
    low: 'Low Risk',
  }
  return statusMap[status] || status
}

// 添加全选和取消全选的方法
function selectAll() {
  contributors.value = contributors.value.map(contributor => ({
    ...contributor,
    isSecurity: true,
  }))
}

function unselectAll() {
  contributors.value = contributors.value.map(contributor => ({
    ...contributor,
    isSecurity: false,
  }))
}
</script>

<template>
  <div class="page-container">
    <!-- Search and filter Section -->
    <div class="search-container">
      <el-form :inline="true" :model="searchForm" class="form-content">
        <el-form-item label="Project Name">
          <el-input
            v-model="searchForm.projectName"
            placeholder="Please enter project name"
            style="width: 300px;"
            clearable
          />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="searchForm.status" placeholder="All" style="width: 150px;">
            <el-option label="All" value="all" />
            <el-option label="High Risk" value="high" />
            <el-option label="Medium Risk" value="mid" />
            <el-option label="Low Risk" value="low" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- Buttons -->
      <div class="buttons">
        <HButton style="justify-content: center" @click="handleSearch">
          Search
        </HButton>
        <!--        <el-button type="primary" @click="handleSearch"> -->
        <!--          Search -->
        <!--        </el-button> -->
        <!--        <el-button style="margin-top: 10px;" @click="handleReset"> -->
        <!--          Reset -->
        <!--        </el-button> -->
        <HButton outline style="margin-top: 10px; justify-content: center" @click="handleReset">
          Reset
        </HButton>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <el-table :data="tableData" class="table" height="50vh" empty-text="Empty Data">
        <el-table-column prop="project_name" label="Project Name" align="center" width="300px" />
        <el-table-column prop="displayStatus" label="Status" align="center" width="450px" />
        <el-table-column fixed="right" label="Operations" align="center" width="400px">
          <template #default="scope">
            <h-button @click="handleView(scope.row)">
              View
            </h-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <HDialog
      v-model="showContributorModal"
      title="Security Engineers Selection"
      width="50%"
    >
      <div class="selection-controls mb-4">
        <HButton class="mr-3" outline @click="selectAll">
          Select All
        </HButton>
        <HButton outline @click="unselectAll">
          Unselect All
        </HButton>
      </div>
      <el-table :data="contributors" style="width: 100%;" height="50vh" empty-text="Empty Data">
        <el-table-column prop="email" label="Email" />
        <el-table-column label="Selection" width="90">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isSecurity" class="checkbox" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <HButton class="mr-3" outline @click="showContributorModal = false">Cancel</HButton>
          <HButton type="primary" @click="updateDevInfos">Confirm</HButton>
        </span>
      </template>
    </HDialog>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 垂直居中 */
  min-height: 50vh;
  padding: 20px;
}

.search-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 80%;
  margin-bottom: 20px;
}

.form-content {
  display: flex;
  flex-grow: 1;
  gap: 20px;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.table-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.table {
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.select-box:deep(.el-select) {
  width: 240px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.checkbox :deep(.is-checked .el-checkbox__inner){
  background-color: #0f0f0f;
  border-color: #0f0f0f;
}
.checkbox :deep(.el-checkbox__inner){
  border-color: #0f0f0f;
}

.el-dialog {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.el-dialog__body {
  flex: 1;
  overflow-y: auto;
}

.selection-controls {
  display: flex;
  justify-content: flex-start;
  padding: 0 0 10px 0;
}
</style>
