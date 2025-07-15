<template>
  <div class="sales-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Gestión de Ventas</h1>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog"> Nueva Venta </el-button>
    </div>
    
    <!-- Filtros y búsqueda -->
    <el-card class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchQuery"
            placeholder="Buscar por cliente o ticket..."
            :prefix-icon="Search"
            clearable
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="statusFilter" placeholder="Estado" clearable>
            <el-option label="Todos" value="" />
            <el-option label="Completadas" value="completed" />
            <el-option label="Pendientes" value="pending" />
            <el-option label="Canceladas" value="cancelled" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="dateFilter"
            type="daterange"
            range-separator="A"
            start-placeholder="Fecha inicio"
            end-placeholder="Fecha fin"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
          />
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="applyFilters">Filtrar</el-button>
        </el-col>
        <el-col :span="3">
          <el-button @click="resetFilters">Limpiar</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Tabla de ventas -->
    <el-card>
      <el-table
        :data="filteredSales"
        style="width: 100%"
        v-loading="loading"
        empty-text="No hay ventas disponibles"
      >
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column label="Cliente" width="200">
          <template #default="scope">
            <div class="client-info">
              <el-avatar :size="35">
                {{ scope.row.clientName.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="client-details">
                <div class="client-name">{{ scope.row.clientName }}</div>
                <div class="client-email">{{ scope.row.clientEmail }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Evento" width="180">
          <template #default="scope">
            <div class="event-info">
              <div class="event-name">{{ scope.row.eventName }}</div>
              <div class="event-zone">{{ scope.row.zoneName }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Cantidad" width="100" align="center">
          <template #default="scope">
            <el-tag type="info" size="large">
              {{ scope.row.quantity }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Precio Total" width="120" align="center">
          <template #default="scope">
            <el-tag type="success" size="large">
              ${{ scope.row.totalAmount.toLocaleString() }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Estado" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Fecha Venta" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="Acciones" width="300" fixed="right">
          <template #default="scope">
            <el-tooltip content="Ver detalles" placement="top">
              <el-button type="info" size="small" :icon="View" @click="viewSale(scope.row)" />
            </el-tooltip>

            <el-tooltip v-if="scope.row.status === 'pending'" content="Confirmar venta" placement="top">
              <el-button type="success" size="small" :icon="Check" @click="confirmSale(scope.row)" />
            </el-tooltip>

            <el-tooltip v-if="scope.row.status === 'pending'" content="Cancelar venta" placement="top">
              <el-button type="danger" size="small" :icon="CloseBold" @click="cancelSale(scope.row)" />
            </el-tooltip>

            <el-tooltip content="Eliminar venta" placement="top">
              <el-button type="danger" size="small" :icon="Delete" @click="deleteSale(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- Paginación -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalSales"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- Dialog para crear nueva venta -->
    <el-dialog
      v-model="showCreateDialog"
      title="Nueva Venta"
      width="600"
      @close="resetForm"
    >
      <el-form
        ref="saleFormRef"
        :model="saleForm"
        :rules="saleRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="Cliente" prop="clientName">
          <el-input
            v-model="saleForm.clientName"
            placeholder="Nombre del cliente"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Email Cliente" prop="clientEmail">
          <el-input v-model="saleForm.clientEmail" type="email" placeholder="correo@ejemplo.com" />
        </el-form-item>

        <el-form-item label="Evento" prop="eventName">
          <el-select v-model="saleForm.eventName" style="width: 100%" placeholder="Seleccionar evento">
            <el-option v-for="event in availableEvents" :key="event.id" :label="event.name" :value="event.name" />
          </el-select>
        </el-form-item>

        <el-form-item label="Zona" prop="zoneName">
          <el-select v-model="saleForm.zoneName" style="width: 100%" placeholder="Seleccionar zona">
            <el-option v-for="zone in availableZones" :key="zone.id" :label="zone.name" :value="zone.name" />
          </el-select>
        </el-form-item>

        <el-form-item label="Cantidad" prop="quantity">
          <el-input-number
            v-model="saleForm.quantity"
            :min="1"
            :max="10"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Precio Unitario" prop="unitPrice">
          <el-input-number
            v-model="saleForm.unitPrice"
            :min="0"
            :step="1000"
            :precision="0"
            style="width: 100%"
            placeholder="Precio por ticket"
          />
        </el-form-item>

        <el-form-item label="Total">
          <el-input
            :value="'$' + (saleForm.quantity * saleForm.unitPrice).toLocaleString()"
            disabled
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">Cancelar</el-button>
          <el-button type="primary" @click="saveSale" :loading="loading">
            Crear Venta
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Dialog para ver detalles de la venta -->
    <el-dialog
      v-model="showDetailDialog"
      title="Detalles de la Venta"
      width="500"
    >
      <div v-if="selectedSale" class="sale-details">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID de Venta">{{ selectedSale.id }}</el-descriptions-item>
          <el-descriptions-item label="Cliente">{{ selectedSale.clientName }}</el-descriptions-item>
          <el-descriptions-item label="Email">{{ selectedSale.clientEmail }}</el-descriptions-item>
          <el-descriptions-item label="Evento">{{ selectedSale.eventName }}</el-descriptions-item>
          <el-descriptions-item label="Zona">{{ selectedSale.zoneName }}</el-descriptions-item>
          <el-descriptions-item label="Cantidad">{{ selectedSale.quantity }} tickets</el-descriptions-item>
          <el-descriptions-item label="Precio Unitario">${{ selectedSale.unitPrice.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="Total">${{ selectedSale.totalAmount.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="Estado">
            <el-tag :type="getStatusTagType(selectedSale.status)">
              {{ getStatusText(selectedSale.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Fecha">{{ formatDate(selectedSale.createdAt) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Edit, Delete, Check, CloseBold, View } from '@element-plus/icons-vue'

// Tipos locales para datos de prueba
type SaleType = {
  id: number
  clientName: string
  clientEmail: string
  eventName: string
  zoneName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

type EventType = {
  id: number
  name: string
}

type ZoneType = {
  id: number
  name: string
  price: number
}

// Referencias
const saleFormRef = ref<FormInstance>()

// Datos de prueba para eventos
const availableEvents = ref<EventType[]>([
  { id: 1, name: 'Concierto Rock' },
  { id: 2, name: 'Feria Tecnológica' },
  { id: 3, name: 'Charla Motivacional' },
])

// Datos de prueba para zonas
const availableZones = ref<ZoneType[]>([
  { id: 1, name: 'VIP', price: 150000 },
  { id: 2, name: 'General', price: 80000 },
  { id: 3, name: 'Platino', price: 200000 },
])

// Datos de prueba para ventas
const sales = ref<SaleType[]>([
  {
    id: 1,
    clientName: 'Juan Pérez',
    clientEmail: 'juan.perez@email.com',
    eventName: 'Concierto Rock',
    zoneName: 'VIP',
    quantity: 2,
    unitPrice: 150000,
    totalAmount: 300000,
    status: 'completed',
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-07-01T10:00:00Z',
  },
  {
    id: 2,
    clientName: 'María González',
    clientEmail: 'maria.gonzalez@email.com',
    eventName: 'Feria Tecnológica',
    zoneName: 'General',
    quantity: 1,
    unitPrice: 80000,
    totalAmount: 80000,
    status: 'pending',
    createdAt: '2025-07-02T11:00:00Z',
    updatedAt: '2025-07-02T11:00:00Z',
  },
  {
    id: 3,
    clientName: 'Carlos Rodríguez',
    clientEmail: 'carlos.rodriguez@email.com',
    eventName: 'Charla Motivacional',
    zoneName: 'Platino',
    quantity: 3,
    unitPrice: 200000,
    totalAmount: 600000,
    status: 'cancelled',
    createdAt: '2025-07-03T12:00:00Z',
    updatedAt: '2025-07-03T12:00:00Z',
  },
  {
    id: 4,
    clientName: 'Ana López',
    clientEmail: 'ana.lopez@email.com',
    eventName: 'Concierto Rock',
    zoneName: 'General',
    quantity: 4,
    unitPrice: 80000,
    totalAmount: 320000,
    status: 'completed',
    createdAt: '2025-07-04T13:00:00Z',
    updatedAt: '2025-07-04T13:00:00Z',
  },
  {
    id: 5,
    clientName: 'Luis Martínez',
    clientEmail: 'luis.martinez@email.com',
    eventName: 'Feria Tecnológica',
    zoneName: 'VIP',
    quantity: 1,
    unitPrice: 150000,
    totalAmount: 150000,
    status: 'pending',
    createdAt: '2025-07-05T14:00:00Z',
    updatedAt: '2025-07-05T14:00:00Z',
  },
])

const loading = ref(false)
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const selectedSale = ref<SaleType | null>(null)

// Filtros
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref<[string, string] | null>(null)

// Variables de paginación
const currentPage = ref(1)
const pageSize = ref(10)
const totalSales = ref(sales.value.length)

// Formulario para crear venta
const saleForm = reactive({
  clientName: '',
  clientEmail: '',
  eventName: '',
  zoneName: '',
  quantity: 1,
  unitPrice: 0,
})

// Reglas de validación
const saleRules: FormRules = reactive({
  clientName: [
    { required: true, message: 'El nombre del cliente es requerido', trigger: 'blur' },
    { min: 2, message: 'El nombre debe tener al menos 2 caracteres', trigger: 'blur' },
    { max: 100, message: 'El nombre no puede exceder 100 caracteres', trigger: 'blur' },
  ],
  clientEmail: [
    { required: true, message: 'El email es requerido', trigger: 'blur' },
    { type: 'email', message: 'Formato de email inválido', trigger: 'blur' },
  ],
  eventName: [
    { required: true, message: 'Debe seleccionar un evento', trigger: 'change' },
  ],
  zoneName: [
    { required: true, message: 'Debe seleccionar una zona', trigger: 'change' },
  ],
  quantity: [
    { required: true, message: 'La cantidad es requerida', trigger: 'blur' },
    { type: 'number', min: 1, message: 'La cantidad debe ser mayor a 0', trigger: 'blur' },
    { type: 'number', max: 10, message: 'La cantidad máxima es 10', trigger: 'blur' },
  ],
  unitPrice: [
    { required: true, message: 'El precio unitario es requerido', trigger: 'blur' },
    { type: 'number', min: 1, message: 'El precio debe ser mayor a 0', trigger: 'blur' },
  ],
})

// Computed
const filteredSales = computed(() => {
  let result = sales.value

  // Filtro por texto
  if (searchQuery.value) {
    result = result.filter(sale => 
      sale.clientName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      sale.clientEmail.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      sale.eventName.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filtro por estado
  if (statusFilter.value) {
    result = result.filter(sale => sale.status === statusFilter.value)
  }

  // Filtro por fecha
  if (dateFilter.value && dateFilter.value.length === 2) {
    const [startDate, endDate] = dateFilter.value
    result = result.filter(sale => {
      const saleDate = sale.createdAt.split('T')[0]
      return saleDate >= startDate && saleDate <= endDate
    })
  }

  // Simular paginación
  totalSales.value = result.length
  const start = (currentPage.value - 1) * pageSize.value
  return result.slice(start, start + pageSize.value)
})

// Métodos
const getStatusTagType = (status: string): string => {
  const types: { [key: string]: string } = {
    completed: 'success',
    pending: 'warning',
    cancelled: 'danger',
  }
  return types[status] || 'info'
}

const getStatusText = (status: string): string => {
  const texts: { [key: string]: string } = {
    completed: 'Completada',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
  }
  return texts[status] || status
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const openCreateDialog = (): void => {
  resetForm()
  showCreateDialog.value = true
}

const viewSale = (sale: SaleType): void => {
  selectedSale.value = sale
  showDetailDialog.value = true
}

const confirmSale = async (sale: SaleType): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `¿Confirmar la venta para ${sale.clientName}?`,
      'Confirmar Venta',
      {
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        type: 'warning',
      }
    )

    // Simular confirmación visual
    const idx = sales.value.findIndex((s: SaleType) => s.id === sale.id)
    if (idx !== -1) {
      sales.value[idx].status = 'completed'
      sales.value[idx].updatedAt = new Date().toISOString()
      ElMessage.success('Venta confirmada exitosamente')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Error al confirmar venta')
    }
  }
}

const cancelSale = async (sale: SaleType): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `¿Cancelar la venta para ${sale.clientName}?`,
      'Cancelar Venta',
      {
        confirmButtonText: 'Cancelar Venta',
        cancelButtonText: 'No Cancelar',
        type: 'warning',
      }
    )

    // Simular cancelación visual
    const idx = sales.value.findIndex((s: SaleType) => s.id === sale.id)
    if (idx !== -1) {
      sales.value[idx].status = 'cancelled'
      sales.value[idx].updatedAt = new Date().toISOString()
      ElMessage.success('Venta cancelada exitosamente')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Error al cancelar venta')
    }
  }
}

const deleteSale = async (sale: SaleType): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `¿Estás seguro de eliminar la venta de ${sale.clientName}?`,
      'Confirmar eliminación',
      {
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        type: 'warning',
      }
    )

    // Simular eliminación visual
    sales.value = sales.value.filter((s: SaleType) => s.id !== sale.id)
    ElMessage.success('Venta eliminada exitosamente')
    totalSales.value = sales.value.length
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Error al eliminar venta')
    }
  }
}

const saveSale = async (): Promise<void> => {
  if (!saleFormRef.value) return

  await saleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true

        // Simular creación visual
        const newId = Math.max(...sales.value.map((s: SaleType) => s.id)) + 1
        const totalAmount = saleForm.quantity * saleForm.unitPrice

        sales.value.push({
          id: newId,
          clientName: saleForm.clientName,
          clientEmail: saleForm.clientEmail,
          eventName: saleForm.eventName,
          zoneName: saleForm.zoneName,
          quantity: saleForm.quantity,
          unitPrice: saleForm.unitPrice,
          totalAmount: totalAmount,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        ElMessage.success('Venta creada exitosamente')
        resetForm()
        showCreateDialog.value = false
        totalSales.value = sales.value.length
      } catch (error) {
        console.error('Error saving sale:', error)
        ElMessage.error('Error al guardar venta')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = (): void => {
  saleForm.clientName = ''
  saleForm.clientEmail = ''
  saleForm.eventName = ''
  saleForm.zoneName = ''
  saleForm.quantity = 1
  saleForm.unitPrice = 0
  saleFormRef.value?.resetFields()
}

const applyFilters = (): void => {
  currentPage.value = 1
}

const resetFilters = (): void => {
  searchQuery.value = ''
  statusFilter.value = ''
  dateFilter.value = null
  currentPage.value = 1
}

const handleSizeChange = (size: number): void => {
  pageSize.value = size
  currentPage.value = 1
}

const handlePageChange = (page: number): void => {
  currentPage.value = page
}

// Inicialización
onMounted(() => {
  // Los datos de prueba ya están cargados
})
</script>

<style scoped>
.sales-page {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.client-details {
  display: flex;
  flex-direction: column;
}

.client-name {
  font-weight: 500;
  color: #303133;
}

.client-email {
  font-size: 12px;
  color: #909399;
}

.event-info {
  display: flex;
  flex-direction: column;
}

.event-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.event-zone {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.sale-details {
  margin: 20px 0;
}
</style>
