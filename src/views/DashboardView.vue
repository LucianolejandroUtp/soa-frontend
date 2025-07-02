<template>
  <div class="dashboard">
    <!-- Estado de las APIs -->
    <el-alert
      v-if="apiHealth.events || apiHealth.users || apiHealth.locations || apiHealth.eventLocations || apiHealth.roles"
      :title="apiHealth.overall ? 'Estado de Servicios' : 'Algunos servicios no están disponibles'"
      :type="apiHealth.overall ? 'success' : 'warning'"
      :description="getApiHealthMessage()"
      style="margin-bottom: 20px"
      show-icon
    />

    <!-- Tarjetas de estadísticas -->
    <div v-if="quickStats.length === 0 && !loadingStats" class="no-stats">
      <el-empty description="No hay estadísticas disponibles">
        <template #description>
          <p>No hay servicios disponibles para mostrar estadísticas.</p>
          <p>Verifica que SOA-BUS y los microservicios estén ejecutándose.</p>
        </template>
        <el-button type="primary" @click="refreshMetrics">
          <el-icon><Refresh /></el-icon>
          Reintentar
        </el-button>
      </el-empty>
    </div>
    
    <el-row v-else :gutter="20" class="stats-cards" v-loading="loadingStats">
      <el-col v-for="stat in quickStats" :key="stat.label" :span="quickStats.length <= 4 ? 6 : 4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div v-if="stat.trend" class="stat-trend">
              <el-icon :style="{ color: getTrendColor(stat.trend.type) }">
                <ArrowUp v-if="stat.trend.type === 'up'" />
                <Minus v-else />
              </el-icon>
              <span>{{ stat.trend.value }}</span>
            </div>
          </div>
          <el-icon class="stat-icon" :style="{ color: stat.color }">
            <component :is="stat.icon" />
          </el-icon>
        </el-card>
      </el-col>
    </el-row>

    <!-- Gráficos y métricas -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card v-loading="loadingMetrics">
          <template #header>
            <div class="card-header">
              <span>Eventos por Mes</span>
              <el-button type="text" @click="refreshMetrics">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="chart-container">
            <div v-if="metrics.eventsByMonth.length === 0" class="no-data">
              <el-empty description="No hay datos disponibles" />
            </div>
            <div v-else class="simple-chart">
              <div v-for="item in metrics.eventsByMonth" :key="item.month" class="chart-bar">
                <div class="bar-container">
                  <div
                    class="bar"
                    :style="{
                      height: `${(item.count / maxEventsInMonth) * 100}%`,
                      backgroundColor: '#409EFF',
                    }"
                  ></div>
                </div>
                <div class="bar-label">{{ item.month }}</div>
                <div class="bar-value">{{ item.count }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card v-loading="loadingMetrics">
          <template #header>
            <span>Top Ubicaciones por Capacidad</span>
          </template>
          <div class="locations-list">
            <div v-if="metrics.locationsByCapacity.length === 0" class="no-data">
              <el-empty description="No hay ubicaciones disponibles" />
            </div>
            <div
              v-else
              v-for="location in metrics.locationsByCapacity"
              :key="location.name"
              class="location-item"
            >
              <div class="location-info">
                <div class="location-name">{{ location.name }}</div>
                <div class="location-capacity">
                  {{ location.capacity.toLocaleString() }} personas
                </div>
              </div>
              <div class="capacity-bar">
                <div
                  class="capacity-fill"
                  :style="{
                    width: `${(location.capacity / maxCapacity) * 100}%`,
                    backgroundColor: '#67C23A',
                  }"
                ></div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Tabla de relaciones recientes -->
    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card v-loading="loadingMetrics">
          <template #header>
            <div class="card-header">
              <span>Relaciones Evento-Ubicación con Precios Más Altos</span>
              <el-button type="primary" size="small" @click="goToEventLocations">
                Ver Todas
              </el-button>
            </div>
          </template>
          <div v-if="metrics.eventLocationsByPrice.length === 0" class="no-data">
            <el-empty description="No hay relaciones disponibles" />
          </div>
          <el-table v-else :data="metrics.eventLocationsByPrice" style="width: 100%">
            <el-table-column prop="name" label="Zona/Ubicación" />
            <el-table-column prop="price" label="Precio" width="120">
              <template #default="scope">
                <el-tag type="success">${{ scope.row.price }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Porcentaje del Máximo" width="200">
              <template #default="scope">
                <el-progress
                  :percentage="(scope.row.price / maxPrice) * 100"
                  :stroke-width="8"
                  :show-text="false"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- Métricas adicionales -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card>
          <el-statistic
            title="Capacidad Total de Ubicaciones"
            :value="metrics.totalCapacity"
            :precision="0"
            suffix="personas"
          >
            <template #prefix>
              <el-icon style="vertical-align: -0.125em">
                <User />
              </el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <el-statistic
            title="Capacidad Promedio"
            :value="metrics.averageCapacity"
            :precision="0"
            suffix="personas"
          >
            <template #prefix>
              <el-icon style="vertical-align: -0.125em">
                <TrendCharts />
              </el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <el-statistic
            title="Precio Promedio de Zona"
            :value="metrics.averagePrice"
            :precision="0"
            prefix="$"
          >
            <template #prefix>
              <el-icon style="vertical-align: -0.125em">
                <Money />
              </el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- Acciones rápidas -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>Acciones Rápidas</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="goToEventLocations">
              <el-icon><Plus /></el-icon>
              Nueva Relación
            </el-button>
            <el-button @click="refreshMetrics">
              <el-icon><Refresh /></el-icon>
              Actualizar Métricas
            </el-button>
            <el-button type="success" @click="router.push('/events')">
              <el-icon><Calendar /></el-icon>
              Ver Eventos
            </el-button>
            <el-button type="info" @click="router.push('/locations')">
              <el-icon><Location /></el-icon>
              Ver Ubicaciones
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  TrendCharts,
  Money,
  Calendar,
  Location,
  ArrowUp,
  Minus,
  Refresh,
  Plus,
} from '@element-plus/icons-vue'
import {
  DashboardService,
  type DashboardMetrics,
  type QuickStats,
} from '@/services/dashboardService'

const router = useRouter()

// Estados reactivos
const loadingStats = ref(false)
const loadingMetrics = ref(false)
const quickStats = ref<QuickStats[]>([])
const metrics = ref<DashboardMetrics>({
  totalEvents: 0,
  activeEvents: 0,
  upcomingEvents: 0,
  eventsThisMonth: 0,
  totalLocations: 0,
  activeLocations: 0,
  totalCapacity: 0,
  averageCapacity: 0,
  totalEventLocations: 0,
  activeEventLocations: 0,
  averagePrice: 0,
  totalUsers: 0,
  activeUsers: 0,
  totalRoles: 0,
  eventsByMonth: [],
  locationsByCapacity: [],
  eventLocationsByPrice: [],
})

const apiHealth = ref({
  events: false,
  locations: false,
  users: false,
  eventLocations: false,
  roles: false,
  overall: false,
})

// Computed properties
const maxEventsInMonth = computed(() => {
  return Math.max(...metrics.value.eventsByMonth.map((item) => item.count), 1)
})

const maxCapacity = computed(() => {
  return Math.max(...metrics.value.locationsByCapacity.map((item) => item.capacity), 1)
})

const maxPrice = computed(() => {
  return Math.max(...metrics.value.eventLocationsByPrice.map((item) => item.price), 1)
})

// Métodos
const loadQuickStats = async (): Promise<void> => {
  try {
    loadingStats.value = true
    quickStats.value = await DashboardService.getQuickStats()
  } catch (error) {
    console.error('Error al cargar estadísticas rápidas:', error)
    ElMessage.error('Error al cargar estadísticas')
  } finally {
    loadingStats.value = false
  }
}

const loadMetrics = async (): Promise<void> => {
  try {
    loadingMetrics.value = true
    metrics.value = await DashboardService.getDashboardMetrics()
  } catch (error) {
    console.error('Error al cargar métricas del dashboard:', error)
    ElMessage.error('Error al cargar métricas del dashboard')
  } finally {
    loadingMetrics.value = false
  }
}

const checkApiHealth = async (): Promise<void> => {
  try {
    apiHealth.value = await DashboardService.checkApiHealth()
  } catch (error) {
    console.error('Error al verificar salud de APIs:', error)
  }
}

const refreshMetrics = async (): Promise<void> => {
  await Promise.all([loadQuickStats(), loadMetrics(), checkApiHealth()])
  ElMessage.success('Métricas actualizadas')
}

const getTrendColor = (type: 'up' | 'down' | 'neutral'): string => {
  switch (type) {
    case 'up':
      return '#67C23A'
    case 'down':
      return '#F56C6C'
    default:
      return '#909399'
  }
}

const getApiHealthMessage = (): string => {
  const availableServices = []
  const unavailableServices = []
  
  if (apiHealth.value.events) availableServices.push('Eventos')
  else unavailableServices.push('Eventos')
  
  if (apiHealth.value.users) availableServices.push('Usuarios')
  else unavailableServices.push('Usuarios')
  
  if (apiHealth.value.locations) availableServices.push('Ubicaciones')
  else unavailableServices.push('Ubicaciones')
  
  if (apiHealth.value.eventLocations) availableServices.push('Relaciones Evento-Ubicación')
  else unavailableServices.push('Relaciones Evento-Ubicación')
  
  if (apiHealth.value.roles) availableServices.push('Roles')
  else unavailableServices.push('Roles')

  if (availableServices.length === 0) {
    return 'No hay servicios disponibles. Verifica la conexión con SOA-BUS.'
  }

  const message = `Servicios disponibles: ${availableServices.join(', ')}.`
  if (unavailableServices.length > 0) {
    return `${message} No disponibles: ${unavailableServices.join(', ')}.`
  }
  
  return message
}

const goToEventLocations = (): void => {
  router.push('/event-locations')
}

// Inicialización
onMounted(async () => {
  await Promise.all([loadQuickStats(), loadMetrics(), checkApiHealth()])
})
</script>

<style scoped>
.dashboard {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

.no-stats {
  margin: 40px 0;
  text-align: center;
}

.stats-cards {
  margin-bottom: 20px;
  width: 100%;
}

.stat-card {
  position: relative;
  overflow: hidden;
  height: 140px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  z-index: 2;
  position: relative;
}

.stat-number {
  font-size: 2.2em;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  color: #606266;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.stat-icon {
  position: absolute;
  right: 16px;
  top: 16px;
  font-size: 2.5em;
  opacity: 0.6;
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 200px;
  padding: 10px;
}

.simple-chart {
  display: flex;
  align-items: flex-end;
  height: 150px;
  gap: 12px;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
}

.bar {
  width: 100%;
  min-height: 4px;
  border-radius: 2px 2px 0 0;
  transition: all 0.3s ease;
}

.bar:hover {
  opacity: 0.8;
}

.bar-label {
  font-size: 11px;
  color: #909399;
  margin-bottom: 2px;
}

.bar-value {
  font-size: 12px;
  font-weight: 600;
  color: #409eff;
}

.locations-list {
  max-height: 200px;
  overflow-y: auto;
}

.location-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.location-item:last-child {
  border-bottom: none;
}

.location-info {
  flex: 1;
  margin-right: 12px;
}

.location-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.location-capacity {
  font-size: 12px;
  color: #909399;
}

.capacity-bar {
  width: 100px;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.capacity-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
}

.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
