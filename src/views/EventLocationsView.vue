<template>
  <div class="event-locations-view">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Gestión de Relaciones Evento-Ubicación</h1>
        <p class="page-subtitle">Administra las zonas y precios de los eventos</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog"> Nueva Relación </el-button>
    </div>

    <!-- Filtros -->
    <el-card class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="6">
          <el-input
            v-model="filters.search"
            placeholder="Buscar por nombre de zona..."
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
          <el-button @click="clearFilters">
            <el-icon><Delete /></el-icon>
            Limpiar
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- Tabla principal -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="filteredEventLocations"
        style="width: 100%"
        :empty-text="loading ? 'Cargando...' : 'No hay relaciones disponibles'"
      >
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column prop="name" label="Zona/Nombre" min-width="200" />

        <el-table-column label="Precio" width="120" sortable>
          <template #default="scope">
            <el-tag type="success" size="large">
              ${{ parseFloat(scope.row.price).toLocaleString() }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Estado" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
              {{ scope.row.isActive ? 'Activo' : 'Inactivo' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Fechas" width="200">
          <template #default="scope">
            <div class="date-info">
              <div class="date-created">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(scope.row.createdAt) }}
              </div>
              <div v-if="scope.row.updatedAt !== scope.row.createdAt" class="date-updated">
                <el-icon><Edit /></el-icon>
                {{ formatDate(scope.row.updatedAt) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Acciones" width="300" fixed="right">
          <template #default="scope">
            <el-tooltip content="Editar relación" placement="top">
              <el-button size="small" type="primary" :icon="Edit" @click="openEditDialog()" />
            </el-tooltip>

            <el-tooltip
              :content="scope.row.isActive ? 'Desactivar relación' : 'Activar relación'"
              placement="top"
            >
              <el-button
                size="small"
                :type="scope.row.isActive ? 'warning' : 'success'"
                :icon="scope.row.isActive ? CloseBold : Check"
                @click="toggleStatus(scope.row)"
              />
            </el-tooltip>

            <el-popconfirm
              title="¿Estás seguro de eliminar esta relación?"
              @confirm="deleteEventLocation(scope.row.id)"
            >
              <template #reference>
                <el-tooltip content="Eliminar relación" placement="top">
                  <el-button size="small" type="danger" :icon="Delete" />
                </el-tooltip>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- Paginación -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Dialog para crear/editar -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Editar Relación' : 'Nueva Relación'"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="Evento" prop="eventId">
          <el-select
            v-model="formData.event_id"
            placeholder="Selecciona un evento"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="event in availableEvents"
              :key="event.id"
              :label="event.name"
              :value="event.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Ubicación" prop="locationId">
          <el-select
            v-model="formData.location_id"
            placeholder="Selecciona una ubicación"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="location in availableLocations"
              :key="location.id"
              :label="`${location.name} (${location.capacity} personas)`"
              :value="location.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Zona/Nombre" prop="name">
          <el-input v-model="formData.name" placeholder="Ej: VIP, General, Platino..." />
        </el-form-item>

        <el-form-item label="Precio" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :step="1000"
            :precision="0"
            style="width: 100%"
            placeholder="Precio en COP"
          />
        </el-form-item>

        <el-form-item v-if="isEditing" label="Estado" prop="isActive">
          <el-switch v-model="formData.isActive" active-text="Activo" inactive-text="Inactivo" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancelar</el-button>
          <el-button type="primary" :loading="formLoading" @click="handleSubmit">
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search, Edit, Delete, Calendar, Check, CloseBold } from '@element-plus/icons-vue'

// Tipos locales para datos de prueba
type EventType = {
  id: number
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
type LocationType = {
  id: number
  name: string
  capacity: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}
type EventLocationType = {
  id: number
  event_id: number
  location_id: number
  name: string
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}
// Estados reactivos
const loading = ref(false)
const formLoading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const formRef = ref<FormInstance>()

// Datos de prueba para eventos
const availableEvents = ref([
  { id: 1, name: 'Concierto Rock', isActive: true, createdAt: '2025-07-01T10:00:00Z', updatedAt: '2025-07-10T12:00:00Z' },
  { id: 2, name: 'Feria Tecnológica', isActive: true, createdAt: '2025-07-02T11:00:00Z', updatedAt: '2025-07-11T13:00:00Z' },
  { id: 3, name: 'Charla Motivacional', isActive: false, createdAt: '2025-07-03T12:00:00Z', updatedAt: '2025-07-12T14:00:00Z' },
])
// Datos de prueba para ubicaciones
const availableLocations = ref([
  { id: 1, name: 'Auditorio Central', capacity: 500, isActive: true, createdAt: '2025-07-01T10:00:00Z', updatedAt: '2025-07-10T12:00:00Z' },
  { id: 2, name: 'Sala de Conferencias', capacity: 120, isActive: true, createdAt: '2025-07-02T11:00:00Z', updatedAt: '2025-07-11T13:00:00Z' },
  { id: 3, name: 'Aula Magna', capacity: 300, isActive: false, createdAt: '2025-07-03T12:00:00Z', updatedAt: '2025-07-12T14:00:00Z' },
])
// Datos de prueba para relaciones evento-ubicación
const eventLocations = ref([
  { id: 1, event_id: 1, location_id: 1, name: 'VIP', price: 150000, isActive: true, createdAt: '2025-07-01T10:00:00Z', updatedAt: '2025-07-10T12:00:00Z' },
  { id: 2, event_id: 1, location_id: 2, name: 'General', price: 80000, isActive: true, createdAt: '2025-07-02T11:00:00Z', updatedAt: '2025-07-11T13:00:00Z' },
  { id: 3, event_id: 2, location_id: 3, name: 'Platino', price: 200000, isActive: false, createdAt: '2025-07-03T12:00:00Z', updatedAt: '2025-07-12T14:00:00Z' },
  { id: 4, event_id: 3, location_id: 1, name: 'General', price: 50000, isActive: true, createdAt: '2025-07-04T13:00:00Z', updatedAt: '2025-07-13T15:00:00Z' },
])

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: eventLocations.value.length,
})

// Composable de filtros
import { useFilters } from '@/composables/useFilters'
const { filters, clearFilters, filterArrayLocally } = useFilters<{
  search: string
  status: string
}>(
  {
    storageKey: 'event-locations-filters',
    debounceMs: 300,
    initialFilters: {
      search: '',
      status: '',
    },
  },
)

// Datos del formulario
const formData = ref<Partial<EventLocationType>>({
  event_id: 0,
  location_id: 0,
  name: '',
  price: 0,
  isActive: true,
})

// Reglas de validación
const formRules = {
  eventId: [{ required: true, message: 'Selecciona un evento', trigger: 'change' }],
  locationId: [{ required: true, message: 'Selecciona una ubicación', trigger: 'change' }],
  name: [
    { required: true, message: 'El nombre de la zona es requerido', trigger: 'blur' },
    { min: 2, max: 100, message: 'Entre 2 y 100 caracteres', trigger: 'blur' },
  ],
  price: [
    { required: true, message: 'El precio es requerido', trigger: 'blur' },
    { type: 'number', min: 0, message: 'El precio debe ser mayor o igual a 0', trigger: 'blur' },
  ],
}

// Computed para relaciones filtradas
const filteredEventLocations = computed(() => {
  let result = filterArrayLocally(eventLocations.value, {
    searchFields: ['name'],
    customFilters: {
      status: (eventLocation: EventLocationType, filterValue: string): boolean => {
        if (filterValue === 'active') return eventLocation.isActive
        if (filterValue === 'inactive') return !eventLocation.isActive
        return true
      },
    },
  })
  pagination.value.total = result.length
  // Simular paginación
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  return result.slice(start, start + pagination.value.pageSize)
})

// Métodos
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const openCreateDialog = (): void => {
  isEditing.value = false
  formData.value = {
    event_id: 0,
    location_id: 0,
    name: '',
    price: 0,
    isActive: true,
  }
  dialogVisible.value = true
}

const openEditDialog = (): void => {
  ElMessage.warning('La edición estará disponible cuando la API devuelva las relaciones completas')
}

const handleDialogClose = (done: () => void): void => {
  if (formLoading.value) {
    ElMessage.warning('Operación en progreso, por favor espera...')
    return
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
  done()
}

const handleSubmit = async (): Promise<void> => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    formLoading.value = true
    // Simular creación visual
    const newId = Math.max(...eventLocations.value.map((e: EventLocationType) => e.id)) + 1
    eventLocations.value.push({
      id: newId,
      event_id: formData.value.event_id ?? 0,
      location_id: formData.value.location_id ?? 0,
      name: formData.value.name ?? '',
      price: formData.value.price ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    ElMessage.success('Relación creada exitosamente')
    dialogVisible.value = false
    formLoading.value = false
  } catch (error) {
    console.error('Error al guardar relación:', error)
    ElMessage.error('Error al guardar la relación')
    formLoading.value = false
  }
}

const toggleStatus = async (eventLocation: EventLocationType): Promise<void> => {
  try {
    const action = eventLocation.isActive ? 'desactivar' : 'activar'
    await ElMessageBox.confirm(`¿Estás seguro de ${action} esta relación?`, 'Confirmar acción', {
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      type: 'warning',
    })
    // Simular cambio de estado visual
    const idx = eventLocations.value.findIndex((e: EventLocationType) => e.id === eventLocation.id)
    if (idx !== -1) {
      eventLocations.value[idx].isActive = !eventLocations.value[idx].isActive
      ElMessage.success(`Relación ${eventLocations.value[idx].isActive ? 'activada' : 'desactivada'}`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error al cambiar estado:', error)
      ElMessage.error('Error al cambiar el estado')
    }
  }
}

const deleteEventLocation = async (id: number): Promise<void> => {
  try {
    // Simular eliminación visual
    eventLocations.value = eventLocations.value.filter((e: EventLocationType) => e.id !== id)
    ElMessage.success('Relación eliminada exitosamente')
    pagination.value.total = eventLocations.value.length
  } catch (error) {
    console.error('Error al eliminar relación:', error)
    ElMessage.error('Error al eliminar la relación')
  }
}

const handleSizeChange = (val: number): void => {
  pagination.value.pageSize = val
  pagination.value.currentPage = 1
}

const handleCurrentChange = (val: number): void => {
  pagination.value.currentPage = val
}

// Inicialización
onMounted(() => {
  // Los datos de prueba ya están cargados
})
</script>

<style scoped>
.event-locations-view {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-subtitle {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 20px;
}

.event-info,
.location-info {
  line-height: 1.4;
}

.event-name,
.location-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.event-meta,
.location-meta {
  font-size: 12px;
  color: #909399;
}

.date-info {
  font-size: 12px;
  line-height: 1.4;
}

.date-created,
.date-updated {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  margin-bottom: 2px;
}

.date-updated {
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
  gap: 12px;
}
</style>
