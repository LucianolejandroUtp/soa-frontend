<template>
  <div class="dashboard">
    <!-- Tarjetas de estadísticas -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">1,234</div>
            <div class="stat-label">Total Usuarios</div>
          </div>
          <el-icon class="stat-icon user-icon"><User /></el-icon>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">89</div>
            <div class="stat-label">Ventas Hoy</div>
          </div>
          <el-icon class="stat-icon sales-icon"><TrendCharts /></el-icon>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">456</div>
            <div class="stat-label">Productos</div>
          </div>
          <el-icon class="stat-icon product-icon"><Box /></el-icon>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">$12,345</div>
            <div class="stat-label">Ingresos</div>
          </div>
          <el-icon class="stat-icon revenue-icon"><Money /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <!-- Gráficos y tablas -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>Ventas Recientes</span>
              <el-button type="primary" size="small">Ver Todo</el-button>
            </div>
          </template>

          <el-table :data="recentSales" style="width: 100%">
            <el-table-column prop="product" label="Producto" />
            <el-table-column prop="customer" label="Cliente" />
            <el-table-column prop="amount" label="Monto">
              <template #default="scope">
                <span class="amount">${{ scope.row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="Estado">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'Completado' ? 'success' : 'warning'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>Actividad Reciente</span>
              <el-button type="default" size="small">Más</el-button>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivity"
              :key="activity.id"
              :timestamp="activity.timestamp"
              :type="activity.type"
            >
              {{ activity.description }}
            </el-timeline-item>
          </el-timeline>
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
            <el-button type="primary" :icon="Plus">Nuevo Usuario</el-button>
            <el-button type="success" :icon="Upload">Subir Archivo</el-button>
            <el-button type="warning" :icon="Setting">Configurar</el-button>
            <el-button type="info" :icon="Document">Reportes</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  User,
  TrendCharts,
  Box,
  Money,
  Plus,
  Upload,
  Setting,
  Document,
} from '@element-plus/icons-vue'

interface Sale {
  product: string
  customer: string
  amount: number
  status: string
}

interface Activity {
  id: number
  description: string
  timestamp: string
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const recentSales = ref<Sale[]>([
  {
    product: 'Laptop HP',
    customer: 'Juan Pérez',
    amount: 1200,
    status: 'Completado',
  },
  {
    product: 'Mouse Logitech',
    customer: 'María García',
    amount: 45,
    status: 'Pendiente',
  },
  {
    product: 'Teclado Mecánico',
    customer: 'Carlos López',
    amount: 89,
    status: 'Completado',
  },
  {
    product: 'Monitor 24"',
    customer: 'Ana Martínez',
    amount: 350,
    status: 'Completado',
  },
])

const recentActivity = ref<Activity[]>([
  {
    id: 1,
    description: 'Usuario "admin" inició sesión',
    timestamp: '2025-06-16 10:30',
    type: 'success',
  },
  {
    id: 2,
    description: 'Nuevo pedido #1234 creado',
    timestamp: '2025-06-16 09:15',
    type: 'primary',
  },
  {
    id: 3,
    description: 'Producto "Laptop" actualizado',
    timestamp: '2025-06-16 08:45',
    type: 'warning',
  },
  {
    id: 4,
    description: 'Backup automático completado',
    timestamp: '2025-06-16 02:00',
    type: 'info',
  },
])
</script>

<style scoped>
.dashboard {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

.stats-cards {
  margin-bottom: 20px;
  width: 100%;
}

.stat-card {
  position: relative;
  overflow: hidden;
  height: 120px;
}

.stat-content {
  z-index: 2;
  position: relative;
}

.stat-number {
  font-size: 2.5em;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
}

.stat-label {
  color: #666;
  margin-top: 8px;
  font-size: 14px;
}

.stat-icon {
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 3em;
  opacity: 0.2;
  z-index: 1;
}

.user-icon {
  color: #409eff;
}

.sales-icon {
  color: #67c23a;
}

.product-icon {
  color: #e6a23c;
}

.revenue-icon {
  color: #f56c6c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount {
  font-weight: bold;
  color: #67c23a;
}

.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
