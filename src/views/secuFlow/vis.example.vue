<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Options } from 'vis-network'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import { ElMessage } from 'element-plus'
import { useProjectVisualizationStore } from '@/store/modules/projectVisualizationStore'
import { htmlToPDF } from '@/utils/html2pdf.ts'

interface MatrixData {
  [email: string]: {
    [email: string]: number
  }
}

interface NodeData {
  id: string
  title: string
  value: number
  group: string
  connections: number
  totalWeight: number
  connectionDetails: { [email: string]: number }
}

interface EdgeData {
  from: string
  to: string
  value: number
  title: string
  color: {
    color: string
    highlight: string
    hover: string
  }
}
const checked1 = ref(false)
const checked2 = ref(false)
const checked3 = ref(false)
const checked4 = ref(false)
const isPdfMode = ref(false)
const projectVisualizationStore = useProjectVisualizationStore()
const analystEmails = ref([])
const requirementsContainer = ref<HTMLElement | null>(null)
const activitiesContainer = ref<HTMLElement | null>(null)
const selectedNode = ref<NodeData | null>(null)
const selectedEdge = ref<EdgeData | null>(null)
const requirementsNodes = ref<DataSet<NodeData> | null>(null)
const requirementsEdges = ref<DataSet<EdgeData> | null>(null)
const activitiesNodes = ref<DataSet<NodeData> | null>(null)
const activitiesEdges = ref<DataSet<EdgeData> | null>(null)
let requirementsNetwork: Network | null = null
let activitiesNetwork: Network | null = null
const selectedNodes = ref<NodeData[]>([])
const searchQueries = ref({
  requirements: '',
  activities: '',
})

const isSidebarVisible = computed(() => selectedNode.value !== null || selectedEdge.value !== null)

const zoomControls = ref({
  requirements: {
    zoomIn: () => requirementsNetwork?.moveTo({ scale: requirementsNetwork.getScale() * 1.2 }),
    zoomOut: () => requirementsNetwork?.moveTo({ scale: requirementsNetwork.getScale() / 1.2 }),
    resetZoom: () => requirementsNetwork?.fit({ animation: true }),
  },
  activities: {
    zoomIn: () => activitiesNetwork?.moveTo({ scale: activitiesNetwork.getScale() * 1.2 }),
    zoomOut: () => activitiesNetwork?.moveTo({ scale: activitiesNetwork.getScale() / 1.2 }),
    resetZoom: () => activitiesNetwork?.fit({ animation: true }),
  },
})

const nodeGroups = {
  analyst: {
    color: { background: '#e74c3c', border: '#c0392b' },
    hover: { background: '#ed7669', border: '#c0392b' },
    highlight: { background: '#f5b7b1', border: '#c0392b' },
  },
  developer: {
    color: { background: '#3498db', border: '#2980b9' },
    hover: { background: '#5faee3', border: '#2980b9' },
    highlight: { background: '#a6d0f3', border: '#2980b9' },
  },
}

const edgeColors = {
  'analyst-analyst': { color: '#e1bee7', highlight: '#9b59b6', hover: '#ce93d8' },
  'analyst-developer': { color: '#ffcccb', highlight: '#e74c3c', hover: '#ef9a9a' },
  'developer-developer': { color: '#bde0fe', highlight: '#3498db', hover: '#90caf9' },
}

function getNodeGroup(email: string): 'analyst' | 'developer' {
  debugger
  return analystEmails.value.includes(email) ? 'analyst' : 'developer'
}

function formatDate(date: string | number): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function convertMatrixToGraph(matrix: MatrixData): { nodes: NodeData[], edges: EdgeData[] } {
  const nodes: NodeData[] = []
  const edges: EdgeData[] = []
  const nodeMap = new Map<string, NodeData>()
  const edgeSet = new Set<string>()

  Object.keys(matrix).forEach((email) => {
    const group = getNodeGroup(email)
    const connectionDetails: { [email: string]: number } = {}
    let connections = 0
    let totalWeight = 0

    Object.entries(matrix[email]).forEach(([toEmail, weight]) => {
      if (email !== toEmail && weight > 0) {
        connections++
        totalWeight += weight
        connectionDetails[toEmail] = weight
      }
    })

    const node: NodeData = {
      id: email,
      title: email,
      value: Math.sqrt(connections),
      group,
      connections,
      totalWeight,
      connectionDetails,
    }
    nodes.push(node)
    nodeMap.set(email, node)
  })

  Object.entries(matrix).forEach(([fromEmail, connections]) => {
    Object.entries(connections).forEach(([toEmail, weight]) => {
      if (fromEmail !== toEmail && weight > 0) {
        const edgeId = [fromEmail, toEmail].sort().join('--')
        if (!edgeSet.has(edgeId)) {
          const fromGroup = getNodeGroup(fromEmail)
          const toGroup = getNodeGroup(toEmail)
          const colorKey = [fromGroup, toGroup].sort().join('-') as keyof typeof edgeColors
          edges.push({
            from: fromEmail,
            to: toEmail,
            value: Math.log(weight + 1),
            title: `Weight: ${weight}`,
            color: edgeColors[colorKey],
          })
          edgeSet.add(edgeId)
        }
      }
    })
  })

  return { nodes, edges }
}

function createNetwork(container: HTMLElement, data: { nodes: DataSet<NodeData>, edges: DataSet<EdgeData> }): Network {
  const nodeCount = data.nodes.length
  const baseSpringLength = Math.sqrt(nodeCount) * 10
  // const baseSpringLength = nodeCount * 0.8
  const options: Options = {
    nodes: {
      shape: 'dot',
      scaling: {
        min: 5,
        max: 30,
      },
      borderWidth: 2,
      shadow: true,
      color: {
        highlight: {
          border: '#ffa000',
          background: '#ffecb3',
        },
      },
    },
    edges: {
      width: 0.15,
      smooth: {
        type: 'continuous',
        forceDirection: 'none',
      },
    },
    groups: nodeGroups,
    physics: {
      stabilization: {
        iterations: 300,
        updateInterval: 25,
      },
      barnesHut: {
        gravitationalConstant: -2000 * Math.log(nodeCount),
        centralGravity: 0.1,
        springLength: baseSpringLength,
        springConstant: 0.04,
        damping: 0.09,
        avoidOverlap: 0.5,
      },
    },
    layout: {
      improvedLayout: false,
    },
    interaction: {
      hover: true,
      tooltipDelay: 200,
      hideEdgesOnDrag: true,
      multiselect: true,
      navigationButtons: true,
      keyboard: true,
      zoomView: true,
    },
  }

  const network = new Network(container, data, options)

  network.on('stabilizationIterationsDone', () => {
    network.setOptions({ physics: false })
  })

  return network
}

function searchNodes(networkType: 'requirements' | 'activities') {
  const nodes = networkType === 'requirements' ? requirementsNodes.value : activitiesNodes.value
  const network = networkType === 'requirements' ? requirementsNetwork : activitiesNetwork
  const query = searchQueries.value[networkType]

  // eslint-disable-next-line style/max-statements-per-line
  if (!nodes || !network || !query) { return }

  const searchResults = nodes.get({
    filter: node => node.id.toLowerCase().includes(query.toLowerCase()),
  })

  if (searchResults.length > 0) {
    network.selectNodes(searchResults.map(node => node.id))
    network.focus(searchResults[0].id, {
      scale: 1.2,
      animation: true,
    })
  }
  else {
    // eslint-disable-next-line no-alert
    alert('No nodes found matching the search query.')
  }
}

function handleNetworkClick(params: any, networkType: 'requirements' | 'activities') {
  const nodes = networkType === 'requirements' ? requirementsNodes.value : activitiesNodes.value
  const edges = networkType === 'requirements' ? requirementsEdges.value : activitiesEdges.value

  if (params.nodes.length > 0) {
    const nodeId = params.nodes[0]
    selectedNodes.value = [nodes?.get(nodeId)]
    selectedEdge.value = null
  }
  else if (params.edges.length > 0) {
    const edgeId = params.edges[0]
    const edge = edges?.get(edgeId)
    selectedEdge.value = edge
    if (edge) {
      selectedNodes.value = [nodes?.get(edge.from), nodes?.get(edge.to)].filter(Boolean) as NodeData[]
    }
  }
  else {
    selectedNodes.value = []
    selectedEdge.value = null
  }
}

async function fetchDataAndCreateNetworks() {
  try {
    await projectVisualizationStore.fetchProjectData()

    const requirementsData = convertMatrixToGraph(projectVisualizationStore.requirementsMatrix)
    const activitiesData = convertMatrixToGraph(projectVisualizationStore.activitiesMatrix)
    analystEmails.value = projectVisualizationStore.analystEmails
    console.log(analystEmails.value)
    requirementsNodes.value = new DataSet<NodeData>(requirementsData.nodes)
    requirementsEdges.value = new DataSet<EdgeData>(requirementsData.edges)
    activitiesNodes.value = new DataSet<NodeData>(activitiesData.nodes)
    activitiesEdges.value = new DataSet<EdgeData>(activitiesData.edges)

    if (requirementsContainer.value && activitiesContainer.value) {
      requirementsNetwork = createNetwork(requirementsContainer.value, { nodes: requirementsNodes.value, edges: requirementsEdges.value })
      activitiesNetwork = createNetwork(activitiesContainer.value, { nodes: activitiesNodes.value, edges: activitiesEdges.value })

      requirementsNetwork.on('click', params => handleNetworkClick(params, 'requirements'))
      activitiesNetwork.on('click', params => handleNetworkClick(params, 'activities'))

      requirementsNetwork.on('click', ({ nodes, edges }) => {
        if (nodes.length > 0) {
          selectedNode.value = requirementsNodes.value?.get(nodes[0])
        }
        else if (edges.length > 0) {
          selectedEdge.value = requirementsEdges.value?.get(edges[0])
        }
        else {
          selectedNode.value = null
          selectedEdge.value = null
        }
      })

      activitiesNetwork.on('click', ({ nodes, edges }) => {
        if (nodes.length > 0) {
          selectedNode.value = activitiesNodes.value?.get(nodes[0])
        }
        else if (edges.length > 0) {
          selectedEdge.value = activitiesEdges.value?.get(edges[0])
        }
        else {
          selectedNode.value = null
          selectedEdge.value = null
        }
      })
    }
  }
  catch (error) {
    console.error('Error fetching or processing data:', error)
  }
}

// report part
async function generateReport() {
  const selectedTeams = [
    { checked: checked1.value, label: 'Development Team' },
    { checked: checked2.value, label: 'Security Team' },
    { checked: checked3.value, label: 'Operations Team' },
    { checked: checked4.value, label: 'Project Manager' },
  ].filter(team => team.checked)
    .map(team => team.label)

  if (selectedTeams.length === 0) {
    ElMessage.warning('please select at least 1 team')
    return
  }

  try {
    isPdfMode.value = true
    // 等待 DOM 更新
    await nextTick()
    // 等待图表重新渲染（如果需要的话）
    await new Promise(resolve => setTimeout(resolve, 1000))

    await htmlToPDF('report-id', 'Project Report', '#fff', selectedTeams)

    const message = `Report generated successfully for: ${selectedTeams.join(', ')} Member`
    ElMessage.success(message)
  }
  catch (error) {
    console.error('Error generating PDF:', error)
    ElMessage.error('Failed to generate report')
  }
  finally {
    isPdfMode.value = false
  }
}

onMounted(() => {
  fetchDataAndCreateNetworks()
})
</script>

<template>
  <div id="report-id" class="network-container">
    <header class="project-header">
      <h1>{{ projectVisualizationStore.projectName }}</h1>
      <p>Created on: {{ formatDate(projectVisualizationStore.createTime) }}</p>
    </header>

    <div class="graphs-container">
      <div class="graph-wrapper">
        <h3>Coordination Requirements Graph</h3>
        <div class="graph-area">
          <div ref="requirementsContainer" class="network-graph" />
          <div v-if="!isPdfMode" class="graph-controls">
            <div class="zoom-controls">
              <HButton @click="zoomControls.requirements.zoomIn">
                +
              </HButton>
              <HButton @click="zoomControls.requirements.zoomOut">
                -
              </HButton>
              <HButton @click="zoomControls.requirements.resetZoom">
                Reset
              </HButton>
            </div>
            <div class="search-control">
              <input v-model="searchQueries.requirements" placeholder="Search nodes" @keyup.enter="searchNodes('requirements')">
              <HButton @click="searchNodes('requirements')">
                Search
              </HButton>
            </div>
          </div>
        </div>
      </div>

      <div class="legend-wrapper">
        <div class="legend">
          <h4>Legend</h4>
          <div class="node-types">
            <h5>Node Types:</h5>
            <div v-for="(group, type) in nodeGroups" :key="type" class="legend-item">
              <span class="color-dot" :style="{ backgroundColor: group.color.background }" />
              <span>{{ type }}</span>
            </div>
          </div>
          <div class="edge-types">
            <h5>Edge Types:</h5>
            <div v-for="(color, type) in edgeColors" :key="type" class="legend-item">
              <span class="color-line" :style="{ backgroundColor: color.color }" />
              <span>{{ type }}</span>
            </div>
          </div>
        </div>
        <div class="mc-stc-wrapper">
          <h3>MC-STC Value: {{ projectVisualizationStore.mcstcValue.toFixed(4) }}</h3>
          <div class="progress-bar">
            <div class="progress" :style="{ width: `${projectVisualizationStore.mcstcValue * 100}%` }" />
          </div>
        </div>
        <div class="report">
          <div class="my-2">
            <el-row>
              <el-col :span="14">
                <el-checkbox v-model="checked1" label="Development Team" size="small" />
              </el-col>
              <el-col :span="10">
                <el-checkbox v-model="checked2" label="Security Team" size="small" />
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="14">
                <el-checkbox v-model="checked3" label="Operations Team" size="small" />
              </el-col>
              <el-col :span="10">
                <el-checkbox v-model="checked4" label="Project Manager" size="small" />
              </el-col>
            </el-row>
          </div>
          <div class="btn-box mt-3">
            <h-button class="justify-center" @click="generateReport">
              Generate Report
            </h-button>
          </div>
        </div>
      </div>

      <div class="graph-wrapper">
        <h3>Coordination Activities Graph</h3>
        <div class="graph-area">
          <div ref="activitiesContainer" class="network-graph" />
          <div v-if="!isPdfMode" class="graph-controls">
            <div class="zoom-controls">
              <HButton @click="zoomControls.activities.zoomIn">
                +
              </HButton>
              <HButton @click="zoomControls.activities.zoomOut">
                -
              </HButton>
              <HButton @click="zoomControls.activities.resetZoom">
                Reset
              </HButton>
            </div>
            <div class="search-control">
              <input v-model="searchQueries.activities" placeholder="Search nodes" @keyup.enter="searchNodes('activities')">
              <HButton @click="searchNodes('activities')">
                Search
              </HButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="slide">
      <div v-if="!isPdfMode && selectedNodes.length > 0 || selectedEdge" class="sidebar">
        <button class="close-btn" @click="selectedNodes = []; selectedEdge = null">
          &times;
        </button>
        <template v-if="selectedNodes.length === 1">
          <h3>Node Details</h3>
          <p><strong>Email:</strong> {{ selectedNodes[0].id }}</p>
          <p><strong>Connected Nodes:</strong> {{ selectedNodes[0].connections }}</p>
          <p><strong>Total Weight:</strong> {{ selectedNodes[0].totalWeight }}</p>
          <p><strong>Group:</strong> {{ selectedNodes[0].group }}</p>
          <h4>Connection Details:</h4>
          <ul>
            <li v-for="(weight, email) in selectedNodes[0].connectionDetails" :key="email">
              {{ email }}: {{ weight }}
            </li>
          </ul>
        </template>
        <template v-else-if="selectedEdge && selectedNodes.length === 2">
          <h3>Edge Details</h3>
          <p><strong>Weight:</strong> {{ selectedEdge.title.split(': ')[1] }}</p>
          <h4>Connected Nodes:</h4>
          <div v-for="node in selectedNodes" :key="node.id">
            <h5>{{ node.id }}</h5>
            <p><strong>Group:</strong> {{ node.group }}</p>
            <p><strong>Connections:</strong> {{ node.connections }}</p>
            <p><strong>Total Weight:</strong> {{ node.totalWeight }}</p>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.network-container {
  display: flex;
  flex-direction: column;
  //height: 100vh;
  padding: 10px;
  background-color: #f5f7fa;
  font-family: Arial, sans-serif;
}

.project-header {
  margin-bottom: 20px;
  text-align: center;
}

.project-header h1 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.project-header p {
  font-size: 14px;
  color: #7f8c8d;
}

.graphs-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.graph-wrapper {
  width: 40%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 15px;
}

.legend-wrapper {
  width: 18%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 20px;
}

.legend, .mc-stc-wrapper, .report{
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 15px;
}
.report{
  .btn-box{
    width: 100%;
    display: flex;
    justify-content: center;
  }
}

.graph-area {
  position: relative;
  height: 500px;
}

.network-graph {
  width: 100%;
  height: 100%;
}

.graph-controls {
  position: absolute;
  top: -5vh;
  right: 5vh;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.zoom-controls, .search-control {
  display: flex;
  gap: 5px;
  flex-direction: row-reverse;
}

.zoom-controls button, .search-control button {
  padding: 5px 10px;
  transition: background-color 0.3s;
}

.zoom-controls button:hover, .search-control button:hover {
  background-color: #2980b9;
}

.search-control input {
  padding: 5px;
  width: 150px;
  border: 1px solid #bdc3c7;
  border-radius: 3px;
  font-size: 14px;
}

.legend h4, .mc-stc-wrapper h3 {
  font-size: 16px;
  color: #34495e;
  margin-bottom: 10px;
}

.legend h5 {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 10px;
  margin-bottom: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 5px;
}

.color-line {
  width: 20px;
  height: 3px;
  margin-right: 5px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #2ecc71;
  transition: width 0.5s ease-in-out;
}

/* Sidebar styles remain unchanged */
.sidebar {
  position: absolute;
  right: 0;
  top: 0;
  width: 300px;
  height: 80vh;
  background-color: white;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  padding: 20px;
  overflow-y: auto;
  z-index: 11;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #7f8c8d;
}
</style>
