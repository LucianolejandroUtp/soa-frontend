<template>
  <div class="roles-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Gestión de Roles</h1>
      <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
        Nuevo Rol
      </el-button>
    </div>

    <!-- Filtros -->
    <el-card class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchQuery"
            placeholder="Buscar por nombre..."
            :prefix-icon="Search"
            clearable
            @input="applyFilters"
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="statusFilter" placeholder="Estado" clearable @change="applyFilters">
            <el-option label="Activos" :value="true" />
            <el-option label="Inactivos" :value="false" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="applyFilters">Filtrar</el-button>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetFilters">Limpiar</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Tabla de roles -->
    <el-card>
      <el-table
        :data="filteredRoles"
        style="width: 100%"
        v-loading="loading"
        empty-text="No hay roles disponibles"
      >
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column prop="name" label="Nombre del Rol" min-width="200" />

        <el-table-column label="Estado" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
              {{ scope.row.isActive ? 'Activo' : 'Inactivo' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Fecha Creación" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Acciones" width="300" fixed="right">
          <template #default="scope">
            <el-tooltip content="Editar rol" placement="top">
              <el-button type="primary" size="small" :icon="Edit" @click="editRole(scope.row)" />
            </el-tooltip>
            <el-tooltip
              :content="scope.row.isActive ? 'Desactivar rol' : 'Activar rol'"
              placement="top"
            >
              <el-button
                :type="scope.row.isActive ? 'warning' : 'success'"
                size="small"
                :icon="scope.row.isActive ? CloseBold : Check"
                @click="toggleRoleStatus(scope.row)"
              />
            </el-tooltip>

            <el-tooltip content="Eliminar rol" placement="top">
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                :disabled="scope.row.id <= 3"
                @click="deleteRole(scope.row)"
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
          :total="totalRoles"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    <!-- Dialog para crear/editar rol -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'"
      width="500"
      @close="resetForm"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="Nombre" prop="name">
          <el-input
            v-model="roleForm.name"
            placeholder="Ingrese el nombre del rol"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">Cancelar</el-button>
          <el-button type="primary" @click="saveRole" :loading="loading">
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
import { Plus, Search, Edit, Delete, Check, CloseBold } from '@element-plus/icons-vue'
// import { RoleService } from '@/services/roleService'
import type { Role } from '@/types/api'

// Referencias
const roleFormRef = ref<FormInstance>()

// Datos de prueba para roles
const roles = ref<Role[]>([
  {
    id: 1,
    name: 'Administrador',
    isActive: true,
    deleted: false,
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-07-10T12:00:00Z',
  },
  {
    id: 2,
    name: 'Vendedor',
    isActive: true,
    deleted: false,
    createdAt: '2025-07-02T11:00:00Z',
    updatedAt: '2025-07-11T13:00:00Z',
  },
  {
    id: 3,
    name: 'Cliente',
    isActive: false,
    deleted: false,
    createdAt: '2025-07-03T12:00:00Z',
    updatedAt: '2025-07-12T14:00:00Z',
  },
  {
    id: 4,
    name: 'Supervisor',
    isActive: true,
    deleted: false,
    createdAt: '2025-07-04T13:00:00Z',
    updatedAt: '2025-07-13T15:00:00Z',
  },
  {
    id: 5,
    name: 'Invitado',
    isActive: false,
    deleted: false,
    createdAt: '2025-07-05T14:00:00Z',
    updatedAt: '2025-07-14T16:00:00Z',
  },
])
const loading = ref(false)
const showCreateDialog = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const statusFilter = ref<boolean | null>(null)

// Variables de paginación
const currentPage = ref(1)
const pageSize = ref(10)
const totalRoles = ref(roles.value.length)

// Formulario para crear/editar rol
const roleForm = reactive({
  id: 0,
  name: '',
})

// Reglas de validación
const roleRules: FormRules = reactive({
  name: [
    { required: true, message: 'El nombre del rol es requerido', trigger: 'blur' },
    { min: 2, message: 'El nombre debe tener al menos 2 caracteres', trigger: 'blur' },
    { max: 50, message: 'El nombre no puede exceder 50 caracteres', trigger: 'blur' },
  ],
})

// Computed
const filteredRoles = computed(() => {
  let result = roles.value
  if (searchQuery.value) {
    result = result.filter(r => r.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }
  if (statusFilter.value !== null) {
    result = result.filter(r => r.isActive === statusFilter.value)
  }
  // Simular paginación
  totalRoles.value = result.length
  const start = (currentPage.value - 1) * pageSize.value
  return result.slice(start, start + pageSize.value)
})

// Métodos
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const editRole = (role: Role) => {
  isEditing.value = true
  roleForm.id = role.id
  roleForm.name = role.name
  showCreateDialog.value = true
}

const deleteRole = async (role: Role) => {
  if (role.id <= 3) {
    ElMessage.warning('No se pueden eliminar los roles del sistema (ID 1-3)')
    return
  }
  try {
    await ElMessageBox.confirm(
      `¿Estás seguro de eliminar el rol "${role.name}"?`,
      'Confirmar eliminación',
      {
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        type: 'warning',
      },
    )
    loading.value = true
    // Simular eliminación visual
    roles.value = roles.value.filter(r => r.id !== role.id)
    ElMessage.success('Rol eliminado exitosamente')
    totalRoles.value = roles.value.length
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting role:', error)
      ElMessage.error('Error al eliminar rol')
    }
  } finally {
    loading.value = false
  }
}

const toggleRoleStatus = async (role: Role) => {
  try {
    loading.value = true
    // Simular cambio de estado visual
    const idx = roles.value.findIndex(r => r.id === role.id)
    if (idx !== -1) {
      roles.value[idx].isActive = !roles.value[idx].isActive
      ElMessage.success(`Rol ${roles.value[idx].isActive ? 'activado' : 'desactivado'} exitosamente`)
    }
  } catch (error) {
    console.error('Error toggling role status:', error)
    ElMessage.error('Error al cambiar estado del rol')
  } finally {
    loading.value = false
  }
}

const saveRole = async () => {
  if (!roleFormRef.value) return
  await roleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true
        if (isEditing.value) {
          // Simular edición visual
          const idx = roles.value.findIndex(r => r.id === roleForm.id)
          if (idx !== -1) {
            roles.value[idx].name = roleForm.name
            ElMessage.success('Rol actualizado exitosamente')
          }
        } else {
          // Simular creación visual
          const newId = Math.max(...roles.value.map(r => r.id)) + 1
          roles.value.push({
            id: newId,
            name: roleForm.name,
            isActive: true,
            deleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          ElMessage.success('Rol creado exitosamente')
          totalRoles.value = roles.value.length
        }
        resetForm()
        showCreateDialog.value = false
      } catch (error) {
        console.error('Error saving role:', error)
        ElMessage.error('Error al guardar rol')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = () => {
  roleForm.id = 0
  roleForm.name = ''
  isEditing.value = false
  roleFormRef.value?.resetFields()
}

const applyFilters = () => {
  currentPage.value = 1 // Reiniciar a la primera página cuando se aplican filtros
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = null
  currentPage.value = 1
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

// Inicialización
onMounted(() => {
  // No se realiza fetch, los datos son locales
})
</script>

<style scoped>
.roles-page {
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
