<template>
  <div class="events-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Gestión de Eventos</h1>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog"> Nuevo Evento </el-button>
    </div>
    <!-- Filtros y búsqueda -->
    <el-card class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="6">
          <el-input
            v-model="filters.search"
            placeholder="Buscar eventos..."
            :prefix-icon="Search"
            clearable
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.status" placeholder="Estado" clearable>
            <el-option label="Todos" value="" />
            <el-option label="Activos" value="active" />
            <el-option label="Inactivos" value="inactive" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-date-picker
            v-model="filters.dateFrom"
            type="date"
            placeholder="Fecha desde"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
          />
        </el-col>
        <el-col :span="4">
          <el-date-picker
            v-model="filters.dateTo"
            type="date"
            placeholder="Fecha hasta"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
          />
        </el-col>
        <el-col :span="3">
          <el-button @click="clearFilters">Limpiar</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- Tabla de eventos -->
    <el-card>
      <el-table
        :data="filteredEvents"
        style="width: 100%"
        v-loading="loading"
        empty-text="No hay eventos disponibles"
      >
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column label="Evento" width="300">
          <template #default="scope">
            <div class="event-info">
              <div class="event-name">{{ scope.row.name }}</div>
              <div class="event-description">{{ scope.row.description }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Fechas del Evento" width="200">
          <template #default="scope">
            <div class="date-info">
              <div class="start-date">
                <el-icon><Calendar /></el-icon>
                Inicio: {{ formatDate(scope.row.startDate) }}
              </div>
              <div class="end-date">
                <el-icon><Calendar /></el-icon>
                Fin: {{ formatDate(scope.row.endDate) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Periodo de Venta" width="200">
          <template #default="scope">
            <div class="sale-info">
              <div class="sale-start">
                <el-icon><ShoppingCart /></el-icon>
                Inicia: {{ formatDate(scope.row.saleStart) }}
              </div>
              <div class="sale-end">
                <el-icon><ShoppingCart /></el-icon>
                Termina: {{ formatDate(scope.row.saleEnd) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Estado" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
              {{ scope.row.isActive ? 'Activo' : 'Inactivo' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Fecha Creación" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="Acciones" width="300" fixed="right">
          <template #default="scope">
            <el-tooltip content="Editar evento" placement="top">
              <el-button type="primary" size="small" :icon="Edit" @click="editEvent(scope.row)" />
            </el-tooltip>

            <el-tooltip
              :content="scope.row.isActive ? 'Desactivar evento' : 'Activar evento'"
              placement="top"
            >
              <el-button
                :type="scope.row.isActive ? 'warning' : 'success'"
                size="small"
                :icon="scope.row.isActive ? CloseBold : Check"
                @click="toggleEventStatus(scope.row)"
              />
            </el-tooltip>

            <el-tooltip content="Eliminar evento" placement="top">
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                @click="deleteEvent(scope.row)"
              />
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
          :total="totalEvents"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- Dialog para crear/editar evento -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'"
      width="600"
      @close="resetForm"
    >
      <el-form
        ref="eventFormRef"
        :model="eventForm"
        :rules="eventRules"
        label-width="150px"
        label-position="left"
      >
        <el-form-item label="Nombre" prop="name">
          <el-input
            v-model="eventForm.name"
            placeholder="Ingrese el nombre del evento"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Descripción" prop="description">
          <el-input
            v-model="eventForm.description"
            type="textarea"
            :rows="3"
            placeholder="Descripción del evento"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Fecha Inicio" prop="startDate">
              <el-date-picker
                v-model="eventForm.startDate"
                type="datetime"
                placeholder="Fecha y hora de inicio"
                format="DD/MM/YYYY HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Fecha Fin" prop="endDate">
              <el-date-picker
                v-model="eventForm.endDate"
                type="datetime"
                placeholder="Fecha y hora de fin"
                format="DD/MM/YYYY HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Inicio Ventas" prop="saleStart">
              <el-date-picker
                v-model="eventForm.saleStart"
                type="datetime"
                placeholder="Inicio de ventas"
                format="DD/MM/YYYY HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Fin Ventas" prop="saleEnd">
              <el-date-picker
                v-model="eventForm.saleEnd"
                type="datetime"
                placeholder="Fin de ventas"
                format="DD/MM/YYYY HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">Cancelar</el-button>
          <el-button type="primary" @click="saveEvent" :loading="loading">
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Plus,
  Search,
  Edit,
  Delete,
  Calendar,
  ShoppingCart,
  Check,
  CloseBold,
} from '@element-plus/icons-vue'
import { EventService } from '@/services/eventService'
import { useFilters } from '@/composables/useFilters'
import type { Event, CreateEventDto, UpdateEventDto } from '@/types/api'

// Referencias
const eventFormRef = ref<FormInstance>()

// Estados reactivos
const events = ref<Event[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const isEditing = ref(false)

// Composable de filtros
const { filters, clearFilters, filterArrayLocally } = useFilters<{
  search: string
  status: string
  dateFrom: string
  dateTo: string
}>({
  storageKey: 'events-filters',
  debounceMs: 300,
  initialFilters: {
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  },
})

// Variables de paginación
const currentPage = ref(1)
const pageSize = ref(10)
const totalEvents = ref(0)

// Formulario para crear/editar evento
const eventForm = reactive({
  id: 0,
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  saleStart: '',
  saleEnd: '',
})

// Reglas de validación
const eventRules: FormRules = reactive({
  name: [
    { required: true, message: 'El nombre es requerido', trigger: 'blur' },
    { min: 3, message: 'El nombre debe tener al menos 3 caracteres', trigger: 'blur' },
    { max: 100, message: 'El nombre no puede exceder 100 caracteres', trigger: 'blur' },
  ],
  description: [
    { required: true, message: 'La descripción es requerida', trigger: 'blur' },
    { min: 10, message: 'La descripción debe tener al menos 10 caracteres', trigger: 'blur' },
    { max: 500, message: 'La descripción no puede exceder 500 caracteres', trigger: 'blur' },
  ],
  startDate: [{ required: true, message: 'La fecha de inicio es requerida', trigger: 'change' }],
  endDate: [{ required: true, message: 'La fecha de fin es requerida', trigger: 'change' }],
  saleStart: [
    { required: true, message: 'La fecha de inicio de ventas es requerida', trigger: 'change' },
  ],
  saleEnd: [
    { required: true, message: 'La fecha de fin de ventas es requerida', trigger: 'change' },
  ],
})

// Métodos
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Computed para eventos filtrados
const filteredEvents = computed(() => {
  const result = filterArrayLocally(events.value, {
    searchFields: ['name', 'description'],
    customFilters: {
      status: (event: Event, filterValue: string) => {
        if (filterValue === 'active') return event.isActive
        if (filterValue === 'inactive') return !event.isActive
        return true // Si no hay filtro de estado, mostrar todos
      },
      dateFrom: (event: Event, filterValue: string) => {
        if (!filterValue) return true
        const eventStart = new Date(event.startDate).toISOString().split('T')[0]
        return eventStart >= filterValue
      },
      dateTo: (event: Event, filterValue: string) => {
        if (!filterValue) return true
        const eventStart = new Date(event.startDate).toISOString().split('T')[0]
        return eventStart <= filterValue
      },
    },
  })

  return result
})

const fetchEvents = async () => {
  try {
    loading.value = true

    // Primero intentamos con paginación, si falla usamos getAllEvents
    try {
      const response = await EventService.getEventsPaginated({
        page: currentPage.value,
        items: pageSize.value,
      })

      events.value = response.response || []
      totalEvents.value = response.pagination?.totalItems || 0
    } catch {
      // Fallback: obtener todos los eventos y simular paginación en el frontend
      const allEvents = await EventService.getAllEvents()

      // Simular paginación en el frontend
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value

      events.value = allEvents.slice(startIndex, endIndex)
      totalEvents.value = allEvents.length
    }
  } catch (error) {
    console.error('❌ Error al cargar eventos:', error)
    ElMessage.error('Error al cargar eventos')
    events.value = []
    totalEvents.value = 0
  } finally {
    loading.value = false
  }
}

const editEvent = (event: Event) => {
  isEditing.value = true
  eventForm.id = event.id
  eventForm.name = event.name
  eventForm.description = event.description
  eventForm.startDate = event.startDate
  eventForm.endDate = event.endDate
  eventForm.saleStart = event.saleStart
  eventForm.saleEnd = event.saleEnd
  showCreateDialog.value = true
}

const toggleEventStatus = async (event: Event) => {
  try {
    loading.value = true
    const action = event.isActive ? 'desactivar' : 'activar'

    await ElMessageBox.confirm(
      `¿Estás seguro de ${action} el evento "${event.name}"?`,
      `Confirmar ${action}`,
      {
        confirmButtonText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelButtonText: 'Cancelar',
        type: 'warning',
      },
    )

    if (event.isActive) {
      await EventService.deactivateEvent(event.id)
      ElMessage.success('Evento desactivado exitosamente')
    } else {
      await EventService.activateEvent(event.id)
      ElMessage.success('Evento activado exitosamente')
    }

    await fetchEvents()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error toggling event status:', error)
      ElMessage.error('Error al cambiar el estado del evento')
    }
  } finally {
    loading.value = false
  }
}

const deleteEvent = async (event: Event) => {
  try {
    await ElMessageBox.confirm(
      `¿Estás seguro de eliminar el evento "${event.name}"? Esta acción no se puede deshacer.`,
      'Confirmar eliminación',
      {
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        type: 'warning',
      },
    )

    loading.value = true
    await EventService.deleteEvent(event.id)
    ElMessage.success('Evento eliminado exitosamente')
    await fetchEvents()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting event:', error)
      ElMessage.error('Error al eliminar evento')
    }
  } finally {
    loading.value = false
  }
}

const saveEvent = async () => {
  if (!eventFormRef.value) return

  await eventFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true

        if (isEditing.value) {
          const updateData: UpdateEventDto = {
            event_id: eventForm.id,
            name: eventForm.name,
            description: eventForm.description,
            start_date: eventForm.startDate,
            end_date: eventForm.endDate,
            sale_start: eventForm.saleStart,
            sale_end: eventForm.saleEnd,
          }

          await EventService.updateEvent(updateData)
          ElMessage.success('Evento actualizado exitosamente')
        } else {
          const createData: CreateEventDto = {
            name: eventForm.name,
            description: eventForm.description,
            start_date: eventForm.startDate,
            end_date: eventForm.endDate,
            sale_start: eventForm.saleStart,
            sale_end: eventForm.saleEnd,
          }

          await EventService.createEvent(createData)
          ElMessage.success('Evento creado exitosamente')
        }

        resetForm()
        showCreateDialog.value = false
        await fetchEvents()
      } catch (error) {
        console.error('Error saving event:', error)
        ElMessage.error('Error al guardar evento')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = () => {
  eventForm.id = 0
  eventForm.name = ''
  eventForm.description = ''
  eventForm.startDate = ''
  eventForm.endDate = ''
  eventForm.saleStart = ''
  eventForm.saleEnd = ''
  isEditing.value = false
  eventFormRef.value?.resetFields()
}

const openCreateDialog = () => {
  resetForm()
  showCreateDialog.value = true
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchEvents()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchEvents()
}

// Inicialización
onMounted(async () => {
  await fetchEvents()
})
</script>

<style scoped>
.events-page {
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

.event-info {
  display: flex;
  flex-direction: column;
}

.event-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.event-description {
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
}

.date-info,
.sale-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-info div,
.sale-info div {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
}

.start-date,
.sale-start {
  color: #67c23a;
}

.end-date,
.sale-end {
  color: #f56c6c;
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
</style>
