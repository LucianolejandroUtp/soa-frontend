<template>
  <div class="tickets-view">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Gestión de Tickets</h1>
        <p class="header-description">
          Administra los tickets de eventos, controla el stock y gestiona las ventas
        </p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          Crear Ticket
        </el-button>
      </div>
    </div>

    <!-- Filters -->
    <el-card shadow="never" class="filter-card">
      <div class="filters">
        <div class="filter-row">
          <el-input
            v-model="filters.search"
            placeholder="Buscar por nombre o evento..."
            style="width: 300px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="filters.eventId"
            placeholder="Filtrar por evento"
            style="width: 200px"
            clearable
          >
            <el-option
              v-for="event in eventsOptions"
              :key="event.id"
              :label="event.name"
              :value="event.id"
            />
          </el-select>

          <el-select
            v-model="filters.type"
            placeholder="Tipo de ticket"
            style="width: 150px"
            clearable
          >
            <el-option label="General" value="general" />
            <el-option label="VIP" value="vip" />
            <el-option label="Premium" value="premium" />
            <el-option label="Estudiante" value="student" />
          </el-select>

          <el-select
            v-model="filters.status"
            placeholder="Estado"
            style="width: 120px"
            clearable
          >
            <el-option label="Activo" value="active" />
            <el-option label="Agotado" value="sold_out" />
            <el-option label="Inactivo" value="inactive" />
          </el-select>

          <el-button @click="resetFilters">
            <el-icon><Refresh /></el-icon>
            Limpiar
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- Table -->
    <el-card shadow="never">
      <el-table 
        :data="paginatedTickets" 
        style="width: 100%"
        v-loading="loading"
        empty-text="No hay tickets disponibles"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="name" label="Nombre" min-width="200" sortable="custom">
          <template #default="{ row }">
            <div class="ticket-info">
              <strong>{{ row.name }}</strong>
              <div class="ticket-description">{{ row.description }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="eventName" label="Evento" min-width="180" sortable="custom">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.eventName }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="Tipo" width="120" sortable="custom">
          <template #default="{ row }">
            <el-tag 
              :type="getTypeTagType(row.type)" 
              size="small"
            >
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="price" label="Precio" width="120" sortable="custom">
          <template #default="{ row }">
            <strong class="price">${{ row.price.toLocaleString() }}</strong>
          </template>
        </el-table-column>

        <el-table-column prop="totalQuantity" label="Stock Total" width="120" sortable="custom">
          <template #default="{ row }">
            <span>{{ row.totalQuantity.toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="soldQuantity" label="Vendidos" width="120" sortable="custom">
          <template #default="{ row }">
            <span>{{ row.soldQuantity.toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Disponibles" width="120">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.availableQuantity === 0 }">
              {{ row.availableQuantity.toLocaleString() }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="Estado" width="120" sortable="custom">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusTagType(row.status)" 
              size="small"
            >
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Acciones" width="160" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button 
                size="small" 
                @click="viewTicket(row)"
                :icon="View"
              />
              <el-button 
                size="small" 
                type="primary" 
                @click="editTicket(row)"
                :icon="Edit"
              />
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteTicket(row)"
                :icon="Delete"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 25, 50, 100]"
          :total="filteredTickets.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Editar Ticket' : 'Crear Ticket'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="Nombre" prop="name">
          <el-input 
            v-model="formData.name" 
            placeholder="Ingrese el nombre del ticket"
          />
        </el-form-item>

        <el-form-item label="Descripción" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea"
            :rows="3"
            placeholder="Descripción del ticket"
          />
        </el-form-item>

        <el-form-item label="Evento" prop="eventId">
          <el-select v-model="formData.eventId" style="width: 100%">
            <el-option
              v-for="event in eventsOptions"
              :key="event.id"
              :label="event.name"
              :value="event.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Tipo" prop="type">
          <el-select v-model="formData.type" style="width: 100%">
            <el-option label="General" value="general" />
            <el-option label="VIP" value="vip" />
            <el-option label="Premium" value="premium" />
            <el-option label="Estudiante" value="student" />
          </el-select>
        </el-form-item>

        <div class="form-row">
          <el-form-item label="Precio" prop="price">
            <el-input-number
              v-model="formData.price"
              :min="0"
              :precision="0"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="Cantidad Total" prop="totalQuantity">
            <el-input-number
              v-model="formData.totalQuantity"
              :min="1"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <el-form-item label="Estado" prop="status">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option label="Activo" value="active" />
            <el-option label="Inactivo" value="inactive" />
          </el-select>
        </el-form-item>

        <el-form-item label="Fecha Inicio" prop="saleStartDate">
          <el-date-picker
            v-model="formData.saleStartDate"
            type="datetime"
            placeholder="Fecha de inicio de ventas"
            style="width: 100%"
            format="DD/MM/YYYY HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="Fecha Fin" prop="saleEndDate">
          <el-date-picker
            v-model="formData.saleEndDate"
            type="datetime"
            placeholder="Fecha de fin de ventas"
            style="width: 100%"
            format="DD/MM/YYYY HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
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

    <!-- View Dialog -->
    <el-dialog
      v-model="viewDialogVisible"
      title="Detalles del Ticket"
      width="500px"
    >
      <div v-if="selectedTicket" class="ticket-details">
        <div class="detail-section">
          <h4>Información General</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Nombre:</label>
              <span>{{ selectedTicket.name }}</span>
            </div>
            <div class="detail-item">
              <label>Descripción:</label>
              <span>{{ selectedTicket.description }}</span>
            </div>
            <div class="detail-item">
              <label>Evento:</label>
              <el-tag type="info">{{ selectedTicket.eventName }}</el-tag>
            </div>
            <div class="detail-item">
              <label>Tipo:</label>
              <el-tag :type="getTypeTagType(selectedTicket.type)">
                {{ getTypeLabel(selectedTicket.type) }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Información de Ventas</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Precio:</label>
              <strong class="price">${{ selectedTicket.price.toLocaleString() }}</strong>
            </div>
            <div class="detail-item">
              <label>Stock Total:</label>
              <span>{{ selectedTicket.totalQuantity.toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <label>Vendidos:</label>
              <span>{{ selectedTicket.soldQuantity.toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <label>Disponibles:</label>
              <span :class="{ 'text-danger': selectedTicket.availableQuantity === 0 }">
                {{ selectedTicket.availableQuantity.toLocaleString() }}
              </span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Estado y Fechas</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Estado:</label>
              <el-tag :type="getStatusTagType(selectedTicket.status)">
                {{ getStatusLabel(selectedTicket.status) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>Inicio de Ventas:</label>
              <span>{{ formatDate(selectedTicket.saleStartDate) }}</span>
            </div>
            <div class="detail-item">
              <label>Fin de Ventas:</label>
              <span>{{ formatDate(selectedTicket.saleEndDate) }}</span>
            </div>
            <div class="detail-item">
              <label>Porcentaje Vendido:</label>
              <el-progress 
                :percentage="Math.round((selectedTicket.soldQuantity / selectedTicket.totalQuantity) * 100)"
                :color="getProgressColor(selectedTicket.soldQuantity / selectedTicket.totalQuantity)"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="viewDialogVisible = false">Cerrar</el-button>
        <el-button 
          type="primary" 
          @click="selectedTicket && editTicket(selectedTicket)"
          :disabled="!selectedTicket"
        >
          Editar Ticket
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
  Refresh,
  View,
  Edit,
  Delete,
} from '@element-plus/icons-vue'

// Types
interface Ticket {
  id: number
  name: string
  description: string
  eventId: number
  eventName: string
  type: 'general' | 'vip' | 'premium' | 'student'
  price: number
  totalQuantity: number
  soldQuantity: number
  availableQuantity: number
  status: 'active' | 'sold_out' | 'inactive'
  saleStartDate: string
  saleEndDate: string
  createdAt: string
  updatedAt: string
}

interface Event {
  id: number
  name: string
}

interface TicketFormData {
  id?: number
  name: string
  description: string
  eventId: number | null
  type: 'general' | 'vip' | 'premium' | 'student'
  price: number
  totalQuantity: number
  status: 'active' | 'inactive'
  saleStartDate: string
  saleEndDate: string
}

// State
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEditing = ref(false)
const selectedTicket = ref<Ticket | null>(null)
const formRef = ref<FormInstance>()

// Mock Data
const tickets = ref<Ticket[]>([
  {
    id: 1,
    name: 'Entrada General - Concierto Rock',
    description: 'Entrada general para el concierto de rock. Incluye acceso a la zona general.',
    eventId: 1,
    eventName: 'Concierto de Rock 2025',
    type: 'general',
    price: 50000,
    totalQuantity: 1000,
    soldQuantity: 750,
    availableQuantity: 250,
    status: 'active',
    saleStartDate: '2025-06-01 10:00:00',
    saleEndDate: '2025-07-20 23:59:00',
    createdAt: '2025-06-01 10:00:00',
    updatedAt: '2025-07-10 15:30:00'
  },
  {
    id: 2,
    name: 'VIP - Concierto Rock',
    description: 'Entrada VIP con acceso preferencial, bebida incluida y meet & greet.',
    eventId: 1,
    eventName: 'Concierto de Rock 2025',
    type: 'vip',
    price: 150000,
    totalQuantity: 100,
    soldQuantity: 100,
    availableQuantity: 0,
    status: 'sold_out',
    saleStartDate: '2025-06-01 10:00:00',
    saleEndDate: '2025-07-20 23:59:00',
    createdAt: '2025-06-01 10:00:00',
    updatedAt: '2025-07-05 18:45:00'
  },
  {
    id: 3,
    name: 'Entrada Conferencia Tech',
    description: 'Acceso completo a todas las charlas y workshops de la conferencia.',
    eventId: 2,
    eventName: 'Conferencia de Tecnología',
    type: 'general',
    price: 120000,
    totalQuantity: 500,
    soldQuantity: 320,
    availableQuantity: 180,
    status: 'active',
    saleStartDate: '2025-05-15 09:00:00',
    saleEndDate: '2025-08-10 23:59:00',
    createdAt: '2025-05-15 09:00:00',
    updatedAt: '2025-07-12 11:20:00'
  },
  {
    id: 4,
    name: 'Estudiante - Conferencia Tech',
    description: 'Entrada con descuento para estudiantes. Requiere carné estudiantil.',
    eventId: 2,
    eventName: 'Conferencia de Tecnología',
    type: 'student',
    price: 60000,
    totalQuantity: 200,
    soldQuantity: 85,
    availableQuantity: 115,
    status: 'active',
    saleStartDate: '2025-05-15 09:00:00',
    saleEndDate: '2025-08-10 23:59:00',
    createdAt: '2025-05-15 09:00:00',
    updatedAt: '2025-07-08 14:15:00'
  },
  {
    id: 5,
    name: 'Premium - Festival Gastronómico',
    description: 'Acceso premium con degustaciones ilimitadas y cena especial.',
    eventId: 3,
    eventName: 'Festival Gastronómico',
    type: 'premium',
    price: 200000,
    totalQuantity: 150,
    soldQuantity: 45,
    availableQuantity: 105,
    status: 'active',
    saleStartDate: '2025-06-20 12:00:00',
    saleEndDate: '2025-09-15 23:59:00',
    createdAt: '2025-06-20 12:00:00',
    updatedAt: '2025-07-14 16:30:00'
  },
  {
    id: 6,
    name: 'General - Festival Gastronómico',
    description: 'Entrada general con acceso a todas las actividades del festival.',
    eventId: 3,
    eventName: 'Festival Gastronómico',
    type: 'general',
    price: 80000,
    totalQuantity: 800,
    soldQuantity: 125,
    availableQuantity: 675,
    status: 'active',
    saleStartDate: '2025-06-20 12:00:00',
    saleEndDate: '2025-09-15 23:59:00',
    createdAt: '2025-06-20 12:00:00',
    updatedAt: '2025-07-13 10:45:00'
  },
  {
    id: 7,
    name: 'Early Bird - Expo Arte',
    description: 'Entrada con descuento por compra anticipada.',
    eventId: 4,
    eventName: 'Exposición de Arte Moderno',
    type: 'general',
    price: 25000,
    totalQuantity: 300,
    soldQuantity: 0,
    availableQuantity: 300,
    status: 'inactive',
    saleStartDate: '2025-08-01 08:00:00',
    saleEndDate: '2025-10-30 20:00:00',
    createdAt: '2025-07-15 08:00:00',
    updatedAt: '2025-07-15 08:00:00'
  },
  {
    id: 8,
    name: 'VIP - Workshop Programación',
    description: 'Acceso VIP con materiales incluidos y mentoría personalizada.',
    eventId: 5,
    eventName: 'Workshop de Programación',
    type: 'vip',
    price: 300000,
    totalQuantity: 25,
    soldQuantity: 18,
    availableQuantity: 7,
    status: 'active',
    saleStartDate: '2025-07-01 09:00:00',
    saleEndDate: '2025-08-25 18:00:00',
    createdAt: '2025-07-01 09:00:00',
    updatedAt: '2025-07-14 20:15:00'
  }
])

const eventsOptions = ref<Event[]>([
  { id: 1, name: 'Concierto de Rock 2025' },
  { id: 2, name: 'Conferencia de Tecnología' },
  { id: 3, name: 'Festival Gastronómico' },
  { id: 4, name: 'Exposición de Arte Moderno' },
  { id: 5, name: 'Workshop de Programación' }
])

// Filters
const filters = reactive({
  search: '',
  eventId: null as number | null,
  type: '',
  status: ''
})

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

// Form
const formData = reactive<TicketFormData>({
  name: '',
  description: '',
  eventId: null,
  type: 'general',
  price: 0,
  totalQuantity: 1,
  status: 'active',
  saleStartDate: '',
  saleEndDate: ''
})

const formRules: FormRules<TicketFormData> = {
  name: [
    { required: true, message: 'Por favor ingrese el nombre del ticket', trigger: 'blur' },
    { min: 3, max: 100, message: 'El nombre debe tener entre 3 y 100 caracteres', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'Por favor ingrese la descripción', trigger: 'blur' },
    { min: 10, max: 500, message: 'La descripción debe tener entre 10 y 500 caracteres', trigger: 'blur' }
  ],
  eventId: [
    { required: true, message: 'Por favor seleccione un evento', trigger: 'change' }
  ],
  type: [
    { required: true, message: 'Por favor seleccione el tipo de ticket', trigger: 'change' }
  ],
  price: [
    { required: true, message: 'Por favor ingrese el precio', trigger: 'blur' },
    { type: 'number', min: 1, message: 'El precio debe ser mayor a 0', trigger: 'blur' }
  ],
  totalQuantity: [
    { required: true, message: 'Por favor ingrese la cantidad total', trigger: 'blur' },
    { type: 'number', min: 1, message: 'La cantidad debe ser mayor a 0', trigger: 'blur' }
  ],
  saleStartDate: [
    { required: true, message: 'Por favor seleccione la fecha de inicio', trigger: 'change' }
  ],
  saleEndDate: [
    { required: true, message: 'Por favor seleccione la fecha de fin', trigger: 'change' }
  ]
}

// Computed
const filteredTickets = computed(() => {
  let result = tickets.value

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter(ticket => 
      ticket.name.toLowerCase().includes(searchLower) ||
      ticket.eventName.toLowerCase().includes(searchLower) ||
      ticket.description.toLowerCase().includes(searchLower)
    )
  }

  if (filters.eventId) {
    result = result.filter(ticket => ticket.eventId === filters.eventId)
  }

  if (filters.type) {
    result = result.filter(ticket => ticket.type === filters.type)
  }

  if (filters.status) {
    result = result.filter(ticket => ticket.status === filters.status)
  }

  // Apply sorting
  if (sorting.prop && sorting.order) {
    result.sort((a, b) => {
      const aVal = a[sorting.prop as keyof Ticket]
      const bVal = b[sorting.prop as keyof Ticket]
      
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

const paginatedTickets = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredTickets.value.slice(start, end)
})

// Methods
const resetFilters = () => {
  filters.search = ''
  filters.eventId = null
  filters.type = ''
  filters.status = ''
  pagination.currentPage = 1
}

const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  sorting.prop = prop
  sorting.order = order || ''
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    general: 'General',
    vip: 'VIP',
    premium: 'Premium',
    student: 'Estudiante'
  }
  return labels[type] || type
}

const getTypeTagType = (type: string) => {
  const types: Record<string, string> = {
    general: '',
    vip: 'warning',
    premium: 'success',
    student: 'info'
  }
  return types[type] || ''
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: 'Activo',
    sold_out: 'Agotado',
    inactive: 'Inactivo'
  }
  return labels[status] || status
}

const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    sold_out: 'danger',
    inactive: 'info'
  }
  return types[status] || ''
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 0.8) return '#f56c6c'
  if (percentage >= 0.6) return '#e6a23c'
  return '#67c23a'
}

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

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    description: '',
    eventId: null,
    type: 'general',
    price: 0,
    totalQuantity: 1,
    status: 'active',
    saleStartDate: '',
    saleEndDate: ''
  })
}

const openCreateDialog = () => {
  resetForm()
  isEditing.value = false
  dialogVisible.value = true
}

const viewTicket = (ticket: Ticket) => {
  selectedTicket.value = ticket
  viewDialogVisible.value = true
}

const editTicket = (ticket: Ticket) => {
  isEditing.value = true
  Object.assign(formData, {
    id: ticket.id,
    name: ticket.name,
    description: ticket.description,
    eventId: ticket.eventId,
    type: ticket.type,
    price: ticket.price,
    totalQuantity: ticket.totalQuantity,
    status: ticket.status,
    saleStartDate: ticket.saleStartDate,
    saleEndDate: ticket.saleEndDate
  })
  viewDialogVisible.value = false
  dialogVisible.value = true
}

const deleteTicket = async (ticket: Ticket) => {
  try {
    await ElMessageBox.confirm(
      `¿Estás seguro de que deseas eliminar el ticket "${ticket.name}"?`,
      'Confirmar Eliminación',
      {
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        type: 'warning',
        center: true
      }
    )

    // Simular eliminación
    const index = tickets.value.findIndex(t => t.id === ticket.id)
    if (index > -1) {
      tickets.value.splice(index, 1)
      ElMessage.success('Ticket eliminado correctamente')
    }
  } catch (error) {
    // Usuario canceló
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

    const eventName = eventsOptions.value.find(e => e.id === formData.eventId)?.name || ''

    if (isEditing.value && formData.id) {
      // Update existing ticket
      const index = tickets.value.findIndex(t => t.id === formData.id)
      if (index > -1) {
        const existingTicket = tickets.value[index]
        tickets.value[index] = {
          ...existingTicket,
          name: formData.name,
          description: formData.description,
          eventId: formData.eventId!,
          eventName: eventName,
          type: formData.type,
          price: formData.price,
          totalQuantity: formData.totalQuantity,
          status: formData.status,
          saleStartDate: formData.saleStartDate,
          saleEndDate: formData.saleEndDate,
          availableQuantity: formData.totalQuantity - existingTicket.soldQuantity,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
      }
      ElMessage.success('Ticket actualizado correctamente')
    } else {
      // Create new ticket
      const newTicket: Ticket = {
        id: Math.max(...tickets.value.map(t => t.id)) + 1,
        name: formData.name,
        description: formData.description,
        eventId: formData.eventId!,
        eventName: eventName,
        type: formData.type,
        price: formData.price,
        totalQuantity: formData.totalQuantity,
        soldQuantity: 0,
        availableQuantity: formData.totalQuantity,
        status: formData.status,
        saleStartDate: formData.saleStartDate,
        saleEndDate: formData.saleEndDate,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
      tickets.value.push(newTicket)
      ElMessage.success('Ticket creado correctamente')
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
  console.log('🎫 TicketsView cargado con', tickets.value.length, 'tickets')
})
</script>

<style scoped>
.tickets-view {
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

.filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.ticket-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ticket-description {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.price {
  color: #67c23a;
  font-weight: 600;
}

.text-danger {
  color: #f56c6c;
  font-weight: 600;
}

.ticket-details {
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

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-row .el-input,
  .filter-row .el-select {
    width: 100% !important;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
