<template>
  <div class="sale-details-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Detalles de Ventas</h1>
        <p class="header-description">
          Gestiona los detalles de cada venta con sus tickets asociados
        </p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">
        Nuevo Detalle
      </el-button>
    </div>

    <!-- Filtros y búsqueda -->
    <el-card class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="5">
          <el-input
            v-model="searchQuery"
            placeholder="Buscar por ID o código..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="5">
          <el-select 
            v-model="saleFilter" 
            placeholder="Filtrar por venta" 
            clearable
            @change="handleFilter"
          >
            <el-option 
              v-for="sale in salesOptions" 
              :key="sale.id" 
              :label="`Venta #${sale.id} - ${sale.clientName}`" 
              :value="sale.id" 
            />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select 
            v-model="ticketFilter" 
            placeholder="Filtrar por ticket" 
            clearable
            @change="handleFilter"
          >
            <el-option 
              v-for="ticket in ticketsOptions" 
              :key="ticket.id" 
              :label="ticket.name" 
              :value="ticket.id" 
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select 
            v-model="statusFilter" 
            placeholder="Estado" 
            clearable
            @change="handleFilter"
          >
            <el-option label="Activos" :value="true" />
            <el-option label="Inactivos" :value="false" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="handleFilter">Filtrar</el-button>
        </el-col>
        <el-col :span="2">
          <el-button @click="clearFilters">Limpiar</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Tabla de detalles de ventas -->
    <el-card>
      <el-table
        :data="paginatedSaleDetails"
        style="width: 100%"
        v-loading="loading"
        empty-text="No hay detalles de ventas disponibles"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />

        <el-table-column label="Venta" width="200" sortable="custom">
          <template #default="{ row }">
            <div class="sale-info">
              <div class="sale-id">Venta #{{ row.saleId }}</div>
              <div class="client-name">{{ row.clientName }}</div>
              <div class="sale-date">{{ formatDate(row.saleDate) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Ticket" width="250" sortable="custom">
          <template #default="{ row }">
            <div class="ticket-info">
              <div class="ticket-name">{{ row.ticketName }}</div>
              <div class="ticket-event">{{ row.eventName }}</div>
              <el-tag :type="getTicketTypeTag(row.ticketType)" size="small">
                {{ getTicketTypeLabel(row.ticketType) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Código" width="150" sortable="custom">
          <template #default="{ row }">
            <el-tag type="info" class="code-tag">{{ row.code }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="amount" label="Monto" width="120" sortable="custom">
          <template #default="{ row }">
            <strong class="amount">${{ row.amount.toLocaleString() }}</strong>
          </template>
        </el-table-column>

        <el-table-column label="Fecha Uso" width="140" sortable="custom">
          <template #default="{ row }">
            <span v-if="row.usedAt" class="used-date">
              {{ formatDate(row.usedAt) }}
            </span>
            <el-tag v-else type="warning" size="small">No usado</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Estado" width="100" align="center" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? 'Activo' : 'Inactivo' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Creado" width="140" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="Acciones" width="200" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="Ver detalles" placement="top">
              <el-button type="info" size="small" :icon="View" @click="viewSaleDetail(row)" />
            </el-tooltip>

            <el-tooltip content="Editar detalle" placement="top">
              <el-button type="primary" size="small" :icon="Edit" @click="editSaleDetail(row)" />
            </el-tooltip>

            <el-tooltip content="Marcar como usado" placement="top" v-if="!row.usedAt">
              <el-button type="success" size="small" :icon="Check" @click="markAsUsed(row)" />
            </el-tooltip>

            <el-tooltip
              :content="row.isActive ? 'Desactivar' : 'Activar'"
              placement="top"
            >
              <el-button
                :type="row.isActive ? 'warning' : 'success'"
                size="small"
                :icon="row.isActive ? 'close' : 'check'"
                @click="toggleStatus(row)"
              />
            </el-tooltip>

            <el-tooltip content="Eliminar" placement="top">
              <el-button type="danger" size="small" :icon="Delete" @click="deleteSaleDetail(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- Paginación -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 25, 50, 100]"
          :total="filteredSaleDetails.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <!-- Dialog para crear/editar -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Editar Detalle de Venta' : 'Crear Detalle de Venta'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
        label-position="left"
      >
        <el-form-item label="Venta" prop="saleId">
          <el-select v-model="formData.saleId" style="width: 100%" placeholder="Seleccionar venta">
            <el-option
              v-for="sale in salesOptions"
              :key="sale.id"
              :label="`Venta #${sale.id} - ${sale.clientName}`"
              :value="sale.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Ticket" prop="ticketId">
          <el-select v-model="formData.ticketId" style="width: 100%" placeholder="Seleccionar ticket">
            <el-option
              v-for="ticket in ticketsOptions"
              :key="ticket.id"
              :label="`${ticket.name} - ${ticket.eventName}`"
              :value="ticket.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Código" prop="code">
          <el-input 
            v-model="formData.code" 
            placeholder="Código único del ticket"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="Monto" prop="amount">
          <el-input-number
            v-model="formData.amount"
            :min="0"
            :precision="0"
            style="width: 100%"
            placeholder="Monto del ticket"
          />
        </el-form-item>

        <el-form-item label="Fecha de Uso" prop="usedAt">
          <el-date-picker
            v-model="formData.usedAt"
            type="datetime"
            placeholder="Fecha y hora de uso (opcional)"
            style="width: 100%"
            format="DD/MM/YYYY HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="Estado" prop="isActive">
          <el-switch
            v-model="formData.isActive"
            active-text="Activo"
            inactive-text="Inactivo"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancelar</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Dialog para ver detalles -->
    <el-dialog
      v-model="viewDialogVisible"
      title="Detalles de Venta"
      width="500px"
    >
      <div v-if="selectedSaleDetail" class="detail-view">
        <div class="detail-section">
          <h4>Información General</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>ID:</label>
              <span>{{ selectedSaleDetail.id }}</span>
            </div>
            <div class="detail-item">
              <label>Código:</label>
              <el-tag type="info">{{ selectedSaleDetail.code }}</el-tag>
            </div>
            <div class="detail-item">
              <label>Monto:</label>
              <strong class="amount">${{ selectedSaleDetail.amount.toLocaleString() }}</strong>
            </div>
            <div class="detail-item">
              <label>Estado:</label>
              <el-tag :type="selectedSaleDetail.isActive ? 'success' : 'danger'">
                {{ selectedSaleDetail.isActive ? 'Activo' : 'Inactivo' }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Información de Venta</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Venta ID:</label>
              <span>{{ selectedSaleDetail.saleId }}</span>
            </div>
            <div class="detail-item">
              <label>Cliente:</label>
              <span>{{ selectedSaleDetail.clientName }}</span>
            </div>
            <div class="detail-item">
              <label>Fecha Venta:</label>
              <span>{{ formatDate(selectedSaleDetail.saleDate) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Información de Ticket</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Ticket:</label>
              <span>{{ selectedSaleDetail.ticketName }}</span>
            </div>
            <div class="detail-item">
              <label>Evento:</label>
              <span>{{ selectedSaleDetail.eventName }}</span>
            </div>
            <div class="detail-item">
              <label>Tipo:</label>
              <el-tag :type="getTicketTypeTag(selectedSaleDetail.ticketType)">
                {{ getTicketTypeLabel(selectedSaleDetail.ticketType) }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Fechas</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Creado:</label>
              <span>{{ formatDate(selectedSaleDetail.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <label>Actualizado:</label>
              <span>{{ formatDate(selectedSaleDetail.updatedAt) }}</span>
            </div>
            <div class="detail-item">
              <label>Usado:</label>
              <span v-if="selectedSaleDetail.usedAt">{{ formatDate(selectedSaleDetail.usedAt) }}</span>
              <el-tag v-else type="warning" size="small">No usado</el-tag>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="viewDialogVisible = false">Cerrar</el-button>
        <el-button 
          type="primary" 
          @click="selectedSaleDetail && editSaleDetail(selectedSaleDetail)"
          :disabled="!selectedSaleDetail"
        >
          Editar
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Plus,
  Search,
  Edit,
  Delete,
  View,
  Check,
} from '@element-plus/icons-vue'

// Types
interface SaleDetail {
  id: number
  saleId: number
  ticketId: number
  code: string
  amount: number
  usedAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  deleted: boolean
  // Información relacionada para la vista
  clientName: string
  saleDate: string
  ticketName: string
  eventName: string
  ticketType: 'general' | 'vip' | 'premium' | 'student'
}

interface Sale {
  id: number
  clientName: string
  date: string
}

interface Ticket {
  id: number
  name: string
  eventName: string
  type: 'general' | 'vip' | 'premium' | 'student'
  price: number
}

interface SaleDetailFormData {
  id?: number
  saleId: number | null
  ticketId: number | null
  code: string
  amount: number
  usedAt: string | null
  isActive: boolean
}

// State
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEditing = ref(false)
const selectedSaleDetail = ref<SaleDetail | null>(null)
const formRef = ref<FormInstance>()

// Filters
const searchQuery = ref('')
const saleFilter = ref<number | null>(null)
const ticketFilter = ref<number | null>(null)
const statusFilter = ref<boolean | null>(null)

// Pagination
const pagination = reactive({
  currentPage: 1,
  pageSize: 25
})

// Sorting
const sorting = reactive({
  prop: '',
  order: ''
})

// Mock Data
const saleDetails = ref<SaleDetail[]>([
  {
    id: 1,
    saleId: 1,
    ticketId: 1,
    code: 'TKT-001-ABC123',
    amount: 50000,
    usedAt: '2025-07-10 19:30:00',
    isActive: true,
    createdAt: '2025-07-01 10:15:00',
    updatedAt: '2025-07-10 19:30:00',
    deleted: false,
    clientName: 'Juan Pérez',
    saleDate: '2025-07-01 10:15:00',
    ticketName: 'Entrada General - Concierto Rock',
    eventName: 'Concierto de Rock 2025',
    ticketType: 'general'
  },
  {
    id: 2,
    saleId: 1,
    ticketId: 2,
    code: 'TKT-002-VIP456',
    amount: 150000,
    usedAt: '2025-07-10 19:00:00',
    isActive: true,
    createdAt: '2025-07-01 10:15:00',
    updatedAt: '2025-07-10 19:00:00',
    deleted: false,
    clientName: 'Juan Pérez',
    saleDate: '2025-07-01 10:15:00',
    ticketName: 'VIP - Concierto Rock',
    eventName: 'Concierto de Rock 2025',
    ticketType: 'vip'
  },
  {
    id: 3,
    saleId: 2,
    ticketId: 3,
    code: 'TKT-003-GEN789',
    amount: 120000,
    usedAt: null,
    isActive: true,
    createdAt: '2025-07-02 14:30:00',
    updatedAt: '2025-07-02 14:30:00',
    deleted: false,
    clientName: 'María García',
    saleDate: '2025-07-02 14:30:00',
    ticketName: 'Entrada Conferencia Tech',
    eventName: 'Conferencia de Tecnología',
    ticketType: 'general'
  },
  {
    id: 4,
    saleId: 2,
    ticketId: 4,
    code: 'TKT-004-STU321',
    amount: 60000,
    usedAt: null,
    isActive: true,
    createdAt: '2025-07-02 14:30:00',
    updatedAt: '2025-07-02 14:30:00',
    deleted: false,
    clientName: 'María García',
    saleDate: '2025-07-02 14:30:00',
    ticketName: 'Estudiante - Conferencia Tech',
    eventName: 'Conferencia de Tecnología',
    ticketType: 'student'
  },
  {
    id: 5,
    saleId: 3,
    ticketId: 5,
    code: 'TKT-005-PREM654',
    amount: 200000,
    usedAt: null,
    isActive: true,
    createdAt: '2025-07-03 16:45:00',
    updatedAt: '2025-07-03 16:45:00',
    deleted: false,
    clientName: 'Carlos López',
    saleDate: '2025-07-03 16:45:00',
    ticketName: 'Premium - Festival Gastronómico',
    eventName: 'Festival Gastronómico',
    ticketType: 'premium'
  },
  {
    id: 6,
    saleId: 4,
    ticketId: 6,
    code: 'TKT-006-GEN987',
    amount: 80000,
    usedAt: null,
    isActive: false,
    createdAt: '2025-07-04 11:20:00',
    updatedAt: '2025-07-12 09:15:00',
    deleted: false,
    clientName: 'Ana Rodríguez',
    saleDate: '2025-07-04 11:20:00',
    ticketName: 'General - Festival Gastronómico',
    eventName: 'Festival Gastronómico',
    ticketType: 'general'
  },
  {
    id: 7,
    saleId: 5,
    ticketId: 8,
    code: 'TKT-007-VIP147',
    amount: 300000,
    usedAt: null,
    isActive: true,
    createdAt: '2025-07-05 13:10:00',
    updatedAt: '2025-07-05 13:10:00',
    deleted: false,
    clientName: 'Pedro Martínez',
    saleDate: '2025-07-05 13:10:00',
    ticketName: 'VIP - Workshop Programación',
    eventName: 'Workshop de Programación',
    ticketType: 'vip'
  },
  {
    id: 8,
    saleId: 6,
    ticketId: 1,
    code: 'TKT-008-GEN258',
    amount: 50000,
    usedAt: '2025-07-11 20:15:00',
    isActive: true,
    createdAt: '2025-07-06 15:40:00',
    updatedAt: '2025-07-11 20:15:00',
    deleted: false,
    clientName: 'Sofía Hernández',
    saleDate: '2025-07-06 15:40:00',
    ticketName: 'Entrada General - Concierto Rock',
    eventName: 'Concierto de Rock 2025',
    ticketType: 'general'
  }
])

const salesOptions = ref<Sale[]>([
  { id: 1, clientName: 'Juan Pérez', date: '2025-07-01 10:15:00' },
  { id: 2, clientName: 'María García', date: '2025-07-02 14:30:00' },
  { id: 3, clientName: 'Carlos López', date: '2025-07-03 16:45:00' },
  { id: 4, clientName: 'Ana Rodríguez', date: '2025-07-04 11:20:00' },
  { id: 5, clientName: 'Pedro Martínez', date: '2025-07-05 13:10:00' },
  { id: 6, clientName: 'Sofía Hernández', date: '2025-07-06 15:40:00' }
])

const ticketsOptions = ref<Ticket[]>([
  { id: 1, name: 'Entrada General - Concierto Rock', eventName: 'Concierto de Rock 2025', type: 'general', price: 50000 },
  { id: 2, name: 'VIP - Concierto Rock', eventName: 'Concierto de Rock 2025', type: 'vip', price: 150000 },
  { id: 3, name: 'Entrada Conferencia Tech', eventName: 'Conferencia de Tecnología', type: 'general', price: 120000 },
  { id: 4, name: 'Estudiante - Conferencia Tech', eventName: 'Conferencia de Tecnología', type: 'student', price: 60000 },
  { id: 5, name: 'Premium - Festival Gastronómico', eventName: 'Festival Gastronómico', type: 'premium', price: 200000 },
  { id: 6, name: 'General - Festival Gastronómico', eventName: 'Festival Gastronómico', type: 'general', price: 80000 },
  { id: 8, name: 'VIP - Workshop Programación', eventName: 'Workshop de Programación', type: 'vip', price: 300000 }
])

// Form Data
const formData = reactive<SaleDetailFormData>({
  saleId: null,
  ticketId: null,
  code: '',
  amount: 0,
  usedAt: null,
  isActive: true
})

const formRules: FormRules<SaleDetailFormData> = {
  saleId: [
    { required: true, message: 'Por favor seleccione una venta', trigger: 'change' }
  ],
  ticketId: [
    { required: true, message: 'Por favor seleccione un ticket', trigger: 'change' }
  ],
  code: [
    { required: true, message: 'Por favor ingrese el código', trigger: 'blur' },
    { min: 5, max: 50, message: 'El código debe tener entre 5 y 50 caracteres', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: 'Por favor ingrese el monto', trigger: 'blur' },
    { type: 'number', min: 1, message: 'El monto debe ser mayor a 0', trigger: 'blur' }
  ]
}

// Computed
const filteredSaleDetails = computed(() => {
  let result = saleDetails.value.filter(detail => !detail.deleted)

  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    result = result.filter(detail => 
      detail.id.toString().includes(search) ||
      detail.code.toLowerCase().includes(search) ||
      detail.clientName.toLowerCase().includes(search) ||
      detail.ticketName.toLowerCase().includes(search)
    )
  }

  if (saleFilter.value !== null) {
    result = result.filter(detail => detail.saleId === saleFilter.value)
  }

  if (ticketFilter.value !== null) {
    result = result.filter(detail => detail.ticketId === ticketFilter.value)
  }

  if (statusFilter.value !== null) {
    result = result.filter(detail => detail.isActive === statusFilter.value)
  }

  // Apply sorting
  if (sorting.prop && sorting.order) {
    result.sort((a, b) => {
      const aVal = a[sorting.prop as keyof SaleDetail]
      const bVal = b[sorting.prop as keyof SaleDetail]
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sorting.order === 'ascending' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sorting.order === 'ascending' ? aVal - bVal : bVal - aVal
      }
      
      return 0
    })
  }

  return result
})

const paginatedSaleDetails = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredSaleDetails.value.slice(start, end)
})

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTicketTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    general: 'General',
    vip: 'VIP',
    premium: 'Premium',
    student: 'Estudiante'
  }
  return labels[type] || type
}

const getTicketTypeTag = (type: string) => {
  const types: Record<string, string> = {
    general: '',
    vip: 'warning',
    premium: 'success',
    student: 'info'
  }
  return types[type] || ''
}

const handleSearch = () => {
  pagination.currentPage = 1
}

const handleFilter = () => {
  pagination.currentPage = 1
}

const clearFilters = () => {
  searchQuery.value = ''
  saleFilter.value = null
  ticketFilter.value = null
  statusFilter.value = null
  pagination.currentPage = 1
}

const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  sorting.prop = prop
  sorting.order = order || ''
}

const resetForm = () => {
  Object.assign(formData, {
    saleId: null,
    ticketId: null,
    code: '',
    amount: 0,
    usedAt: null,
    isActive: true
  })
}

const generateCode = () => {
  const prefix = 'TKT'
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const timestamp = Date.now().toString().slice(-4)
  return `${prefix}-${timestamp}-${random}`
}

const openCreateDialog = () => {
  resetForm()
  formData.code = generateCode()
  isEditing.value = false
  dialogVisible.value = true
}

const viewSaleDetail = (saleDetail: SaleDetail) => {
  selectedSaleDetail.value = saleDetail
  viewDialogVisible.value = true
}

const editSaleDetail = (saleDetail: SaleDetail) => {
  isEditing.value = true
  Object.assign(formData, {
    id: saleDetail.id,
    saleId: saleDetail.saleId,
    ticketId: saleDetail.ticketId,
    code: saleDetail.code,
    amount: saleDetail.amount,
    usedAt: saleDetail.usedAt,
    isActive: saleDetail.isActive
  })
  viewDialogVisible.value = false
  dialogVisible.value = true
}

const markAsUsed = async (saleDetail: SaleDetail) => {
  try {
    await ElMessageBox.confirm(
      '¿Marcar este ticket como usado?',
      'Confirmar Uso',
      {
        confirmButtonText: 'Marcar como Usado',
        cancelButtonText: 'Cancelar',
        type: 'info'
      }
    )

    const index = saleDetails.value.findIndex(d => d.id === saleDetail.id)
    if (index > -1) {
      saleDetails.value[index].usedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
      saleDetails.value[index].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
      ElMessage.success('Ticket marcado como usado correctamente')
    }
  } catch (error) {
    console.log('Acción cancelada')
  }
}

const toggleStatus = async (saleDetail: SaleDetail) => {
  try {
    const action = saleDetail.isActive ? 'desactivar' : 'activar'
    await ElMessageBox.confirm(
      `¿Estás seguro de que deseas ${action} este detalle de venta?`,
      'Confirmar Acción',
      {
        confirmButtonText: action === 'desactivar' ? 'Desactivar' : 'Activar',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }
    )

    const index = saleDetails.value.findIndex(d => d.id === saleDetail.id)
    if (index > -1) {
      saleDetails.value[index].isActive = !saleDetail.isActive
      saleDetails.value[index].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
      ElMessage.success(`Detalle ${action}do correctamente`)
    }
  } catch (error) {
    console.log('Acción cancelada')
  }
}

const deleteSaleDetail = async (saleDetail: SaleDetail) => {
  try {
    await ElMessageBox.confirm(
      `¿Estás seguro de que deseas eliminar el detalle con código "${saleDetail.code}"?`,
      'Confirmar Eliminación',
      {
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }
    )

    const index = saleDetails.value.findIndex(d => d.id === saleDetail.id)
    if (index > -1) {
      saleDetails.value[index].deleted = true
      saleDetails.value[index].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
      ElMessage.success('Detalle eliminado correctamente')
    }
  } catch (error) {
    console.log('Eliminación cancelada')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // Simular API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Get related data
    const sale = salesOptions.value.find(s => s.id === formData.saleId)
    const ticket = ticketsOptions.value.find(t => t.id === formData.ticketId)

    if (isEditing.value && formData.id) {
      // Update existing sale detail
      const index = saleDetails.value.findIndex(d => d.id === formData.id)
      if (index > -1) {
        saleDetails.value[index] = {
          ...saleDetails.value[index],
          saleId: formData.saleId!,
          ticketId: formData.ticketId!,
          code: formData.code,
          amount: formData.amount,
          usedAt: formData.usedAt,
          isActive: formData.isActive,
          clientName: sale?.clientName || '',
          saleDate: sale?.date || '',
          ticketName: ticket?.name || '',
          eventName: ticket?.eventName || '',
          ticketType: ticket?.type || 'general',
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
      }
      ElMessage.success('Detalle actualizado correctamente')
    } else {
      // Create new sale detail
      const newSaleDetail: SaleDetail = {
        id: Math.max(...saleDetails.value.map(d => d.id)) + 1,
        saleId: formData.saleId!,
        ticketId: formData.ticketId!,
        code: formData.code,
        amount: formData.amount,
        usedAt: formData.usedAt,
        isActive: formData.isActive,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        deleted: false,
        clientName: sale?.clientName || '',
        saleDate: sale?.date || '',
        ticketName: ticket?.name || '',
        eventName: ticket?.eventName || '',
        ticketType: ticket?.type || 'general'
      }
      saleDetails.value.push(newSaleDetail)
      ElMessage.success('Detalle creado correctamente')
    }

    dialogVisible.value = false
    resetForm()
  } catch (error) {
    console.error('Error al procesar el formulario:', error)
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  console.log('🎫 SaleDetailsView cargado con', saleDetails.value.length, 'detalles')
})
</script>

<style scoped>
.sale-details-page {
  padding: 0;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-description {
  color: #606266;
  margin: 0;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 16px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.sale-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sale-id {
  font-weight: 600;
  color: #303133;
}

.client-name {
  font-size: 13px;
  color: #606266;
}

.sale-date {
  font-size: 12px;
  color: #909399;
}

.ticket-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ticket-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.ticket-event {
  font-size: 12px;
  color: #606266;
}

.code-tag {
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.amount {
  color: #67c23a;
  font-weight: 600;
}

.used-date {
  font-size: 13px;
  color: #67c23a;
  font-weight: 500;
}

.detail-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.detail-item span {
  font-size: 14px;
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
