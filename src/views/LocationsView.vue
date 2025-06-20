<template>
  <div class="locations-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Gestión de Ubicaciones</h1>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog"> Nueva Ubicación </el-button>
    </div>

    <!-- Filtros y búsqueda (Deshabilitados - Esperando implementación en backend) -->
    <el-card class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchQuery"
            placeholder="Buscar ubicaciones... (Próximamente)"
            :prefix-icon="Search"
            clearable
            disabled
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="statusFilter" placeholder="Estado (Próximamente)" clearable disabled>
            <el-option label="Activas" :value="true" />
            <el-option label="Inactivas" :value="false" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input-number
            v-model="capacityFilter"
            placeholder="Capacidad mínima"
            :min="0"
            disabled
            style="width: 100%"
          />
        </el-col>
        <el-col :span="3">
          <el-button type="primary" disabled>Filtrar</el-button>
        </el-col>
        <el-col :span="3">
          <el-button disabled>Limpiar</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Tabla de ubicaciones -->
    <el-card>
      <el-table
        :data="locations"
        style="width: 100%"
        v-loading="loading"
        empty-text="No hay ubicaciones disponibles"
      >
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column label="Ubicación" width="300">
          <template #default="scope">
            <div class="location-info">
              <div class="location-name">{{ scope.row.name }}</div>
              <div class="location-details">
                <el-icon><Location /></el-icon>
                Ubicación ID: {{ scope.row.id }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Capacidad" width="150" align="center">
          <template #default="scope">
            <div class="capacity-info">
              <el-icon><User /></el-icon>
              <span class="capacity-number">{{ scope.row.capacity.toLocaleString() }}</span>
              <span class="capacity-label">personas</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Estado" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
              {{ scope.row.isActive ? 'Activa' : 'Inactiva' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Fecha Creación" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="Última Actualización" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.updatedAt) }}
          </template>
        </el-table-column>

        <el-table-column label="Acciones" width="300" fixed="right">
          <template #default="scope">
            <el-tooltip content="Editar ubicación" placement="top">
              <el-button
                type="primary"
                size="small"
                :icon="Edit"
                @click="editLocation(scope.row)"
              />
            </el-tooltip>

            <el-tooltip
              :content="scope.row.isActive ? 'Desactivar ubicación' : 'Activar ubicación'"
              placement="top"
            >
              <el-button
                :type="scope.row.isActive ? 'warning' : 'success'"
                size="small"
                :icon="scope.row.isActive ? CloseBold : Check"
                @click="toggleLocationStatus(scope.row)"
              />
            </el-tooltip>

            <el-tooltip content="Eliminar ubicación" placement="top">
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                @click="deleteLocation(scope.row)"
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
          :total="totalLocations"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- Dialog para crear/editar ubicación -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? 'Editar Ubicación' : 'Crear Nueva Ubicación'"
      width="500"
      @close="resetForm"
    >
      <el-form
        ref="locationFormRef"
        :model="locationForm"
        :rules="locationRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="Nombre" prop="name">
          <el-input
            v-model="locationForm.name"
            placeholder="Ingrese el nombre de la ubicación"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Capacidad" prop="capacity">
          <el-input-number
            v-model="locationForm.capacity"
            :min="1"
            :max="999999"
            placeholder="Capacidad máxima"
            style="width: 100%"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px">
            Número máximo de personas que puede albergar la ubicación
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">Cancelar</el-button>
          <el-button type="primary" @click="saveLocation" :loading="loading">
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Plus,
  Search,
  Edit,
  Delete,
  Location,
  User,
  Check,
  CloseBold,
} from '@element-plus/icons-vue'
import { LocationService } from '@/services/locationService'
import type { Location as LocationType, CreateLocationDto, UpdateLocationDto } from '@/types/api'

// Referencias
const locationFormRef = ref<FormInstance>()

// Estados reactivos
const locations = ref<LocationType[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const isEditing = ref(false)

// Mantener variables para la UI (aunque estén deshabilitadas)
const searchQuery = ref('')
const statusFilter = ref<boolean | null>(null)
const capacityFilter = ref<number | null>(null)

// Variables de paginación
const currentPage = ref(1)
const pageSize = ref(10)
const totalLocations = ref(0)

// Formulario para crear/editar ubicación
const locationForm = reactive({
  id: 0,
  name: '',
  capacity: 0,
})

// Reglas de validación
const locationRules: FormRules = reactive({
  name: [
    { required: true, message: 'El nombre es requerido', trigger: 'blur' },
    { min: 3, message: 'El nombre debe tener al menos 3 caracteres', trigger: 'blur' },
    { max: 100, message: 'El nombre no puede exceder 100 caracteres', trigger: 'blur' },
  ],
  capacity: [
    { required: true, message: 'La capacidad es requerida', trigger: 'blur' },
    { type: 'number', min: 1, message: 'La capacidad debe ser mayor a 0', trigger: 'blur' },
    {
      type: 'number',
      max: 999999,
      message: 'La capacidad no puede exceder 999,999',
      trigger: 'blur',
    },
  ],
})

// Métodos
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const fetchLocations = async () => {
  try {
    loading.value = true

    // Primero intentamos con paginación, si falla usamos getAllLocations
    try {
      const response = await LocationService.getLocationsPaginated({
        page: currentPage.value,
        items: pageSize.value,
      })

      locations.value = response.response || []
      totalLocations.value = response.pagination?.totalItems || 0
    } catch {
      // Fallback: obtener todas las ubicaciones y simular paginación en el frontend
      const allLocations = await LocationService.getAllLocations()

      // Simular paginación en el frontend
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value

      locations.value = allLocations.slice(startIndex, endIndex)
      totalLocations.value = allLocations.length
    }
  } catch (error) {
    console.error('❌ Error al cargar ubicaciones:', error)
    ElMessage.error('Error al cargar ubicaciones')
    locations.value = []
    totalLocations.value = 0
  } finally {
    loading.value = false
  }
}

const editLocation = (location: LocationType) => {
  isEditing.value = true
  locationForm.id = location.id
  locationForm.name = location.name
  locationForm.capacity = location.capacity
  showCreateDialog.value = true
}

const toggleLocationStatus = async (location: LocationType) => {
  try {
    loading.value = true
    const action = location.isActive ? 'desactivar' : 'activar'

    await ElMessageBox.confirm(
      `¿Estás seguro de ${action} la ubicación "${location.name}"?`,
      `Confirmar ${action}`,
      {
        confirmButtonText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelButtonText: 'Cancelar',
        type: 'warning',
      },
    )

    if (location.isActive) {
      await LocationService.deactivateLocation(location.id)
      ElMessage.success('Ubicación desactivada exitosamente')
    } else {
      await LocationService.activateLocation(location.id)
      ElMessage.success('Ubicación activada exitosamente')
    }

    await fetchLocations()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error toggling location status:', error)
      ElMessage.error('Error al cambiar el estado de la ubicación')
    }
  } finally {
    loading.value = false
  }
}

const deleteLocation = async (location: LocationType) => {
  try {
    await ElMessageBox.confirm(
      `¿Estás seguro de eliminar la ubicación "${location.name}"? Esta acción no se puede deshacer.`,
      'Confirmar eliminación',
      {
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        type: 'warning',
      },
    )

    loading.value = true
    await LocationService.deleteLocation(location.id)
    ElMessage.success('Ubicación eliminada exitosamente')
    await fetchLocations()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting location:', error)
      ElMessage.error('Error al eliminar ubicación')
    }
  } finally {
    loading.value = false
  }
}

const saveLocation = async () => {
  if (!locationFormRef.value) return

  await locationFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true

        if (isEditing.value) {
          const updateData: UpdateLocationDto = {
            id: locationForm.id,
            name: locationForm.name,
            capacity: locationForm.capacity,
          }

          await LocationService.updateLocation(updateData)
          ElMessage.success('Ubicación actualizada exitosamente')
        } else {
          const createData: CreateLocationDto = {
            name: locationForm.name,
            capacity: locationForm.capacity,
          }

          await LocationService.createLocation(createData)
          ElMessage.success('Ubicación creada exitosamente')
        }

        resetForm()
        showCreateDialog.value = false
        await fetchLocations()
      } catch (error) {
        console.error('Error saving location:', error)
        ElMessage.error('Error al guardar ubicación')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = () => {
  locationForm.id = 0
  locationForm.name = ''
  locationForm.capacity = 0
  isEditing.value = false
  locationFormRef.value?.resetFields()
}

const openCreateDialog = () => {
  resetForm()
  showCreateDialog.value = true
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchLocations()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchLocations()
}

// Inicialización
onMounted(async () => {
  await fetchLocations()
})
</script>

<style scoped>
.locations-page {
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

.location-info {
  display: flex;
  flex-direction: column;
}

.location-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.location-details {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.capacity-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.capacity-number {
  font-weight: 600;
  color: #409eff;
}

.capacity-label {
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
</style>
