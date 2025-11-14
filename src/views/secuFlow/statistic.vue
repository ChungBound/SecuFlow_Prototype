<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Options } from 'vis-network'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProjectVisualizationStore } from '@/store/modules/projectVisualizationStore'
import { htmlToPDF } from '@/utils/html2pdf.ts'

interface MatrixData {
  [email: string]: {
    [email: string]: number
  }
}
interface BaseNodeData {
  id: string
  title: string
  value: number
  group: string
}

interface CANodeData extends BaseNodeData {
  incomingConnections: number
  outgoingConnections: number
  totalConnections: number
  totalWeight: number
  connectionDetails: { [email: string]: { incoming: number, outgoing: number } }
}

interface CRNodeData extends BaseNodeData {
  incomingConnections: number
  outgoingConnections: number
  totalConnections: number
  totalWeight: number
  connectionDetails: { [email: string]: { incoming: number, outgoing: number } }
}

interface EdgeData {
  id: string // 添加 id 属性
  from: string
  to: string
  value: number
  title: string
  arrows?: string
  color: {
    color: string
    highlight: string
    hover: string
  }
}
// loading part
const isLoading = ref(true)
const loadingProgress = ref(0)
// check box part
const checked1 = ref(false)
const checked2 = ref(false)
const checked3 = ref(false)
const checked4 = ref(false)
const isPdfMode = ref(false)
// pinia store data api part
const projectVisualizationStore = useProjectVisualizationStore()

// mtstc bar color
const mcstcColor = computed(() => {
  const value = projectVisualizationStore.mcstcValue
  // eslint-disable-next-line style/max-statements-per-line
  if (value >= 0.76) { return '#4caf50' } // Green
  // eslint-disable-next-line style/max-statements-per-line
  if (value >= 0.26) { return '#ffc107' } // Yellow
  return '#f44336' // Red
})
const stcColor = computed(() => {
  const value = projectVisualizationStore.stcValue
  // eslint-disable-next-line style/max-statements-per-line
  if (value >= 0.76) { return '#4caf50' } // Green
  // eslint-disable-next-line style/max-statements-per-line
  if (value >= 0.26) { return '#ffc107' } // Yellow
  return '#f44336' // Red
})
const analystEmails = ref<string[]>([])
const requirementsContainer = ref<HTMLElement | null>(null)
const activitiesContainer = ref<HTMLElement | null>(null)
const selectedNodes = ref<(CANodeData | CRNodeData)[]>([])
const selectedEdge = ref<EdgeData | null>(null)
const requirementsNodes = ref<DataSet<CRNodeData> | null>(null)
const requirementsEdges = ref<DataSet<EdgeData> | null>(null)
const activitiesNodes = ref<DataSet<CANodeData> | null>(null)
const activitiesEdges = ref<DataSet<EdgeData> | null>(null)
let requirementsNetwork: Network | null = null
let activitiesNetwork: Network | null = null
const searchQueries = ref({
  requirements: '',
  activities: '',
})

// node detail
const showIncoming = ref(true)
const showOutgoing = ref(true)
function toggleIncoming() {
  showIncoming.value = !showIncoming.value
}

function toggleOutgoing() {
  showOutgoing.value = !showOutgoing.value
}
function getIncomingConnections(node: CRNodeData) {
  return Object.entries(node.connectionDetails)
    .filter(([, details]) => details.incoming > 0)
    .reduce((acc, [email, details]) => {
      acc[email] = details.incoming
      return acc
    }, {} as Record<string, number>)
}

function getOutgoingConnections(node: CRNodeData) {
  return Object.entries(node.connectionDetails)
    .filter(([, details]) => details.outgoing > 0)
    .reduce((acc, [email, details]) => {
      acc[email] = details.outgoing
      return acc
    }, {} as Record<string, number>)
}
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
  security_engineer: {
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
  'security_engineer-security_engineer': { color: '#e1bee7', highlight: '#9b59b6', hover: '#ce93d8' },
  'security_engineer-developer': { color: '#ffcccb', highlight: '#e74c3c', hover: '#ef9a9a' },
  'developer-developer': { color: '#bde0fe', highlight: '#3498db', hover: '#90caf9' },
}

function getNodeGroup(email: string): 'security_engineer' | 'developer' {
  return analystEmails.value.includes(email) ? 'security_engineer' : 'developer'
}

function formatDate(date: string | number): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getEdgeColor(fromGroup: string, toGroup: string): { color: string, highlight: string, hover: string } {
  const colorKey = [fromGroup, toGroup].sort().join('-')
  return edgeColors[colorKey as keyof typeof edgeColors]
}
function convertMatrixToCAGraph(matrix: MatrixData): { nodes: DataSet<CANodeData>, edges: DataSet<EdgeData> } {
  const nodes: CANodeData[] = []
  const edges: EdgeData[] = []
  const nodeMap = new Map<string, CANodeData>()
  // const processedEdges = new Set<string>()

  // First pass: create nodes with initial structure
  Object.keys(matrix).forEach((email) => {
    const group = getNodeGroup(email)
    const node: CANodeData = {
      id: email,
      title: email,
      value: 1, // Will be updated later
      group,
      incomingConnections: 0,
      outgoingConnections: 0,
      totalConnections: 0,
      totalWeight: 0,
      connectionDetails: {},
    }
    nodes.push(node)
    nodeMap.set(email, node)
  })

  // Second pass: count connections and create edges
  Object.entries(matrix).forEach(([fromEmail, connections]) => {
    const fromNode = nodeMap.get(fromEmail)!

    Object.entries(connections).forEach(([toEmail, weight]) => {
      if (fromEmail !== toEmail && weight > 0) {
        // Update source node (outgoing)
        fromNode.outgoingConnections++
        fromNode.totalConnections++
        fromNode.totalWeight += weight
        if (!fromNode.connectionDetails[toEmail]) {
          fromNode.connectionDetails[toEmail] = { incoming: 0, outgoing: 0 }
        }
        fromNode.connectionDetails[toEmail].outgoing = weight

        // Update target node (incoming)
        const toNode = nodeMap.get(toEmail)!
        toNode.incomingConnections++
        toNode.totalConnections++
        toNode.totalWeight += weight
        if (!toNode.connectionDetails[fromEmail]) {
          toNode.connectionDetails[fromEmail] = { incoming: 0, outgoing: 0 }
        }
        toNode.connectionDetails[fromEmail].incoming = weight

        // Create edge
        const fromGroup = getNodeGroup(fromEmail)
        const toGroup = getNodeGroup(toEmail)
        const edge: EdgeData = {
          id: `${fromEmail}-${toEmail}`,
          from: fromEmail,
          to: toEmail,
          value: Math.log(weight + 1),
          title: `Weight: ${weight}`,
          arrows: 'to',
          color: getEdgeColor(fromGroup, toGroup),
        }
        edges.push(edge)
      }
    })
  })

  // Update node values based on total connections
  nodes.forEach((node) => {
    node.value = Math.sqrt(node.totalConnections)
  })

  return {
    nodes: new DataSet<CANodeData>(nodes),
    edges: new DataSet<EdgeData>(edges),
  }
}
function convertMatrixToCRGraph(matrix: MatrixData): { nodes: DataSet<CRNodeData>, edges: DataSet<EdgeData> } {
  const nodes: CRNodeData[] = []
  const edges: EdgeData[] = []
  const nodeMap = new Map<string, CRNodeData>()

  // First pass: create nodes with initial structure
  Object.keys(matrix).forEach((email) => {
    const group = getNodeGroup(email)
    const node: CRNodeData = {
      id: email,
      title: email,
      value: 1, // Will be updated later
      group,
      incomingConnections: 0,
      outgoingConnections: 0,
      totalConnections: 0,
      totalWeight: 0,
      connectionDetails: {},
    }
    nodes.push(node)
    nodeMap.set(email, node)
  })

  // Second pass: count connections and create edges
  Object.entries(matrix).forEach(([fromEmail, connections]) => {
    Object.entries(connections).forEach(([toEmail, weight]) => {
      if (fromEmail !== toEmail && weight > 0) {
        const fromNode = nodeMap.get(fromEmail)!
        const toNode = nodeMap.get(toEmail)!

        // Update source node (outgoing)
        fromNode.outgoingConnections++
        fromNode.totalConnections++
        fromNode.totalWeight += weight
        if (!fromNode.connectionDetails[toEmail]) {
          fromNode.connectionDetails[toEmail] = { incoming: 0, outgoing: 0 }
        }
        fromNode.connectionDetails[toEmail].outgoing = weight

        // Update target node (incoming)
        toNode.incomingConnections++
        toNode.totalConnections++
        toNode.totalWeight += weight
        if (!toNode.connectionDetails[fromEmail]) {
          toNode.connectionDetails[fromEmail] = { incoming: 0, outgoing: 0 }
        }
        toNode.connectionDetails[fromEmail].incoming = weight

        // Create edge
        const fromGroup = getNodeGroup(fromEmail)
        const toGroup = getNodeGroup(toEmail)
        const edge: EdgeData = {
          id: `${fromEmail}-${toEmail}`,
          from: fromEmail,
          to: toEmail,
          value: Math.log(weight + 1),
          title: `Weight: ${weight}`,
          arrows: 'to',
          color: getEdgeColor(fromGroup, toGroup),
        }
        edges.push(edge)
      }
    })
  })

  // Update node values based on total connections
  nodes.forEach((node) => {
    node.value = Math.sqrt(node.totalConnections)
  })

  return {
    nodes: new DataSet<CRNodeData>(nodes),
    edges: new DataSet<EdgeData>(edges),
  }
}

function createNetwork(container: HTMLElement, data: { nodes: DataSet<CANodeData | CRNodeData>, edges: DataSet<EdgeData> }, isRequirementsGraph: boolean): Network {
  const nodeCount = data.nodes.length
  const baseSpringLength = Math.sqrt(nodeCount) * 10

  // 原始的 CA 图配置，保持不变
  const caOptions: Options = {
    nodes: {
      shape: 'dot',
      scaling: {
        min: 8,
        max: 50,
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
      width: 0.1,
      // smooth: {
      //   type: 'continuous',
      //   forceDirection: 'none',
      // },
      smooth: false,
      arrows: 'to', // 添加箭头
    },
    groups: nodeGroups,
    physics: {
      stabilization: {
        iterations: 1000,
        updateInterval: 25,
      },
      barnesHut: {
        gravitationalConstant: -10000 * Math.log(nodeCount),
        centralGravity: 0.001,
        springLength: baseSpringLength * 7,
        springConstant: 0.001,
        damping: 0.3,
        avoidOverlap: 0.9,
      },
    },
    layout: {
      improvedLayout: false,
      hierarchical: {
        enabled: false,
      },
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

  // CR 图的优化配置
  const crOptions: Options = {
    nodes: {
      shape: 'dot',
      scaling: {
        min: 8,
        max: 50,
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
      width: 0.1,
      // smooth: {
      //   type: 'cubicBezier',
      //   forceDirection: 'horizontal',
      //   roundness: 0.2,
      // },
      smooth: false,

      arrows: 'to',
    },
    groups: nodeGroups,
    physics: {
      stabilization: {
        iterations: 300,
        updateInterval: 25,
      },
      barnesHut: {
        gravitationalConstant: -10000 * Math.log(nodeCount),
        centralGravity: 0.0001,
        springLength: baseSpringLength * 7,
        springConstant: 0.0005,
        damping: 0.25,
        avoidOverlap: 1,
      },
    },
    layout: {
      improvedLayout: false,
      hierarchical: {
        enabled: false,
      },
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

  // const options = isRequirementsGraph ? crOptions : caOptions
  const options = crOptions

  try {
    const network = new Network(container, data, options)

    network.on('stabilizationIterationsDone', () => {
      network.setOptions({ physics: false })
    })
    if (isRequirementsGraph) {
      network.on('stabilizationProgress', (params) => {
        const maxProgress = params.total
        const currentProgress = params.iterations
        const percent = Math.round((currentProgress / maxProgress) * 100)
        loadingProgress.value = Math.min(95, percent) // 保留最后5%给最终渲染
      })
    }
    return network
  }
  catch (error) {
    console.error('Error creating network:', error)
    return null
  }
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
    isLoading.value = true
    loadingProgress.value = 0
    // 模拟数据加载进度
    // 模拟数据加载进度
    // const progressInterval = setInterval(() => {
    //   if (loadingProgress.value < 80) {
    //     loadingProgress.value += 10
    //   }
    // }, 500)

    await projectVisualizationStore.fetchProjectData()
    analystEmails.value = projectVisualizationStore.analystEmails
    const requirementsData = convertMatrixToCRGraph(projectVisualizationStore.requirementsMatrix)
    const activitiesData = convertMatrixToCAGraph(projectVisualizationStore.activitiesMatrix)
    // loadingProgress.value = 50
    requirementsNodes.value = requirementsData.nodes
    requirementsEdges.value = requirementsData.edges
    activitiesNodes.value = activitiesData.nodes
    activitiesEdges.value = activitiesData.edges

    if (requirementsContainer.value && activitiesContainer.value) {
      requirementsNetwork = createNetwork(requirementsContainer.value, { nodes: requirementsNodes.value, edges: requirementsEdges.value }, true)
      activitiesNetwork = createNetwork(activitiesContainer.value, { nodes: activitiesNodes.value, edges: activitiesEdges.value }, false)
      requirementsNetwork.on('click', params => handleNetworkClick(params, 'requirements'))
      activitiesNetwork.on('click', params => handleNetworkClick(params, 'activities'))

      // 添加网络加载完成的事件监听
      // activitiesNetwork.once('stabilizationIterationsDone', () => {
      //   loadingProgress.value = 90
      // })
      requirementsNetwork.once('stabilizationIterationsDone', () => {
        loadingProgress.value = 100
        isLoading.value = false
        // clearInterval(progressInterval)
      })
    }
  }
  catch (error) {
    console.error('Error fetching or processing data:', error)
    ElMessage.error('Failed to load project data')
  }
}

async function generateReport() {
  const selectedTeams = [
    { checked: checked1.value, label: 'Development Team' },
    { checked: checked2.value, label: 'Security Team' },
    { checked: checked3.value, label: 'Operations Team' },
    { checked: checked4.value, label: 'Project Manager' },
  ].filter(team => team.checked)
    .map(team => team.label)

  if (selectedTeams.length === 0) {
    ElMessage.warning('Please select at least 1 team')
    return
  }

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to generate a report for ${selectedTeams.join(', ')}?`,
      'Confirm Report Generation',
      {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning',
      },
    )

    isPdfMode.value = true
    await nextTick()
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
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner" />
        <p>Loading network data...</p>
        <div class="loading-bar">
          <div class="progress" :style="{ width: `${loadingProgress}%` }" />
        </div>
        <p>{{ loadingProgress }}% Complete</p>
      </div>
    </div>
    <!--    <header class="project-header"> -->
    <!--      <h1>{{ projectVisualizationStore.projectName }}</h1> -->
    <!--      <p>Created on: {{ formatDate(projectVisualizationStore.createTime) }}</p> -->
    <!--    </header> -->

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
        <header class="project-header">
          <h1>{{ projectVisualizationStore.projectName }}</h1>
          <p>Created on: {{ formatDate(projectVisualizationStore.createTime) }}</p>
        </header>
        <div class="legend">
          <!--          <h4>Legend</h4> -->
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
              <span class="color-content">{{ type }}</span>
            </div>
          </div>
        </div>
        <div class="mc-stc-wrapper">
          <h3>MC-STC Value: {{ projectVisualizationStore.mcstcValue.toFixed(4) }}</h3>
          <div class="progress-box">
            <div class="number mr-1">
              0
            </div>
            <div class="progress-bar">
              <div
                class="progress"
                :style="{
                  width: `${projectVisualizationStore.mcstcValue * 100}%`,
                  backgroundColor: mcstcColor,
                }"
              />
            </div>
            <div class="number ml-1">
              1
            </div>
          </div>
        </div>
        <div class="mc-stc-wrapper">
          <h3>STC Value: {{ projectVisualizationStore.stcValue.toFixed(4) }}</h3>
          <div class="progress-box">
            <div class="number mr-1">
              0
            </div>
            <div class="progress-bar">
              <div
                class="progress"
                :style="{
                  width: `${projectVisualizationStore.stcValue * 100}%`,
                  backgroundColor: stcColor,
                }"
              />
            </div>
            <div class="number ml-1">
              1
            </div>
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
          <div v-if="!isPdfMode" class="btn-box mt-3">
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
      <div v-if="!isPdfMode && (selectedNodes.length > 0 || selectedEdge)" class="sidebar">
        <button class="close-btn" @click="selectedNodes = []; selectedEdge = null">
          &times;
        </button>
        <template v-if="selectedNodes.length === 1">
          <h3 class="sidebar-title">
            Node Details
          </h3>
          <div class="detail-item">
            <strong>Email:</strong> {{ selectedNodes[0].id }}
          </div>
          <div class="detail-item">
            <strong>Incoming Connections:</strong> {{ selectedNodes[0].incomingConnections }}
          </div>
          <div class="detail-item">
            <strong>Outgoing Connections:</strong> {{ selectedNodes[0].outgoingConnections }}
          </div>
          <div class="detail-item">
            <strong>Total Connections:</strong> {{ selectedNodes[0].totalConnections }}
          </div>
          <div class="detail-item">
            <strong>Total Weight:</strong> {{ selectedNodes[0].totalWeight.toFixed(2) }}
          </div>
          <div class="detail-item">
            <strong>Group:</strong> {{ selectedNodes[0].group }}
          </div>
          <h4 class="connection-title">
            Connection Details:
          </h4>
          <div class="connection-lists">
            <div class="connection-list">
              <h5 class="list-title" @click="toggleIncoming">
                Incoming Connections
                <span class="toggle-icon">{{ showIncoming ? '▼' : '▶' }}</span>
              </h5>
              <ul v-if="showIncoming">
                <li v-for="(details, email) in getIncomingConnections(selectedNodes[0])" :key="email">
                  {{ email }}: {{ details }}
                </li>
              </ul>
            </div>
            <div class="connection-list">
              <h5 class="list-title" @click="toggleOutgoing">
                Outgoing Connections
                <span class="toggle-icon">{{ showOutgoing ? '▼' : '▶' }}</span>
              </h5>
              <ul v-if="showOutgoing">
                <li v-for="(details, email) in getOutgoingConnections(selectedNodes[0])" :key="email">
                  {{ email }}: {{ details }}
                </li>
              </ul>
            </div>
          </div>
        </template>
        <template v-else-if="selectedEdge && selectedNodes.length === 2">
          <h3 class="sidebar-title">
            Edge Details
          </h3>
          <div class="detail-item">
            <strong>Weight:</strong> {{ selectedEdge.title.split(': ')[1] }}
          </div>
          <h4 class="connection-title">
            Connected Nodes:
          </h4>
          <div v-for="node in selectedNodes" :key="node.id" class="node-details">
            <h5 class="node-email">
              {{ node.id }}
            </h5>
            <div class="detail-item">
              <strong>Group:</strong> {{ node.group }}
            </div>
            <div class="detail-item">
              <strong>Connections:</strong> {{ 'incomingConnections' in node ? (node as CRNodeData).totalConnections : (node as CANodeData).connections }}
            </div>
            <div class="detail-item">
              <strong>Total Weight:</strong> {{ node.totalWeight.toFixed(2) }}
            </div>
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
  padding: 10px;
  font-family: Arial, sans-serif;
}

.project-header {
  text-align: center;
}

.project-header h1 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 5px;
}

.project-header p {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.graphs-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.graph-wrapper {
  height: 73vh;
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

.legend, .mc-stc-wrapper, .report {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 0 15px 5px 15px;
}

.mc-stc-wrapper{
  .number{
    font-size: 10px;
  }
  .progress-box{
    display: flex;
    justify-content: space-between;
    line-height: 10px;
    align-items: center;
  }
}

.report .btn-box {
  width: 100%;
  display: flex;
  justify-content: center;
}

.graph-area {
  position: relative;
  height: 60vh;
}

.network-graph {
  width: 100%;
  height: 100%;
}

.graph-controls {
  position: absolute;
  top: -6vh;
  right: 1vh;
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
  font-size: 0.8rem;
  color: #34495e;
  margin-bottom: 10px;
}

.legend h5 {
  font-size: 1rem;
  color: #7f8c8d;
  margin-top: 10px;
  margin-bottom: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.legend-item span{
  font-size: 0.9rem;
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
.color-content{
  font-size: 12px;
}

.progress-bar {
  width: 100%;
  height: 5px;

  background-color: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
}

.progress {
  height: 100%;
  transition: width 0.5s ease-in-out, background-color 0.5s ease-in-out;
}

.sidebar {
  position: fixed;
  right: 0;
  top: 110px;
  width: 300px;
  height: 85vh;
  background-color: white;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  padding: 20px;
  overflow-y: auto;
  z-index: 11;
}

.sidebar-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ecf0f1;
}

.detail-item {
  margin-bottom: 10px;
  font-size: 14px;
}

.detail-item strong {
  color: #34495e;
}

.connection-title {
  font-size: 16px;
  color: #2c3e50;
  margin-top: 20px;
  margin-bottom: 10px;
}

.connection-lists {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.connection-list {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 10px;
}

.list-title {
  font-size: 14px;
  color: #2c3e50;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.toggle-icon {
  font-size: 12px;
}

.connection-list ul {
  list-style-type: none;
  padding-left: 0;
}

.connection-list li {
  font-size: 12px;
  margin-bottom: 5px;
}

.node-details {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
}

.node-email {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
}

.close-btn:hover {
  color: #34495e;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-bar {
  width: 200px;
  height: 10px;
  background-color: #f3f3f3;
  border-radius: 5px;
  margin: 10px auto;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #3498db;
  transition: width 0.5s ease-in-out;
}
</style>
