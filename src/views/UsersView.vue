<template>
  <div class="users-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Gestión de Usuarios</h1>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog"> Nuevo Usuario </el-button>
    </div>
    <!-- Filtros y búsqueda -->
    <el-card class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchQuery"
            placeholder="Buscar por nombre o email..."
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
        <el-col :span="6">
          <el-select v-model="roleFilter" placeholder="Rol" clearable @change="applyFilters">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="applyFilters">Filtrar</el-button>
        </el-col>
        <el-col :span="3">
          <el-button @click="resetFilters">Limpiar</el-button>
        </el-col>
      </el-row> </el-card
    ><!-- Tabla de usuarios -->
    <el-card>
      <el-table
        :data="filteredUsers"
        style="width: 100%"
        v-loading="loading"
        empty-text="No hay usuarios disponibles"
      >
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column label="Usuario" width="250">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="40">
                {{ scope.row.name.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">{{ scope.row.name }} {{ scope.row.lastname }}</div>
                <div class="user-email">{{ scope.row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Rol" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getRoleTagType(getRoleName(scope.row))">
              {{ getRoleName(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Estado" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
              {{ scope.row.isActive ? 'Activo' : 'Inactivo' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Fecha Registro" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template> </el-table-column
        ><el-table-column label="Acciones" width="250" fixed="right">
          <template #default="scope">
            <el-tooltip content="Editar usuario" placement="top">
              <el-button type="primary" size="small" :icon="Edit" @click="editUser(scope.row)" />
            </el-tooltip>

            <el-tooltip content="Eliminar usuario" placement="top">
              <el-button type="danger" size="small" :icon="Delete" @click="deleteUser(scope.row)" />
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
          :total="totalUsers"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div> </el-card
    ><!-- Dialog para crear/editar usuario -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'"
      width="500"
      @close="resetForm"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="Nombre" prop="name">
          <el-input
            v-model="userForm.name"
            placeholder="Ingrese el nombre"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Apellido" prop="lastname">
          <el-input
            v-model="userForm.lastname"
            placeholder="Ingrese el apellido"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input v-model="userForm.email" type="email" placeholder="correo@ejemplo.com" />
        </el-form-item>

        <el-form-item label="Contraseña" prop="password" :required="!isEditing">
          <el-input
            v-model="userForm.password"
            type="password"
            :placeholder="isEditing ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'"
            show-password
          />
        </el-form-item>

        <el-form-item label="Rol" prop="rolId">
          <el-select v-model="userForm.rolId" style="width: 100%" placeholder="Seleccionar rol">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">Cancelar</el-button>
          <el-button type="primary" @click="saveUser" :loading="loading">
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
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { UserService } from '@/services/userService'
import { RoleService } from '@/services/roleService'
import type { User, Role, CreateUserDto, UpdateUserDto } from '@/types/api'

// Referencias
const userFormRef = ref<FormInstance>()

// Estados reactivos
const users = ref<User[]>([])
const roles = ref<Role[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const statusFilter = ref<boolean | null>(null)
const roleFilter = ref<number | null>(null)

// Variables de paginación
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(0)

// Formulario para crear/editar usuario
const userForm = reactive({
  id: 0,
  name: '',
  lastname: '',
  email: '',
  password: '',
  rolId: null as number | null,
})

// Reglas de validación
const userRules: FormRules = reactive({
  name: [
    { required: true, message: 'El nombre es requerido', trigger: 'blur' },
    { min: 2, message: 'El nombre debe tener al menos 2 caracteres', trigger: 'blur' },
    { max: 50, message: 'El nombre no puede exceder 50 caracteres', trigger: 'blur' },
  ],
  lastname: [
    { required: true, message: 'El apellido es requerido', trigger: 'blur' },
    { min: 2, message: 'El apellido debe tener al menos 2 caracteres', trigger: 'blur' },
    { max: 50, message: 'El apellido no puede exceder 50 caracteres', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'El email es requerido', trigger: 'blur' },
    { type: 'email', message: 'Formato de email inválido', trigger: 'blur' },
  ],
  password: [
    ...(isEditing.value
      ? []
      : [{ required: true, message: 'La contraseña es requerida', trigger: 'blur' }]),
    { min: 6, message: 'La contraseña debe tener al menos 6 caracteres', trigger: 'blur' },
  ],
  rolId: [
    { required: true, message: 'El rol es requerido', trigger: 'change' },
    { type: 'number', min: 1, message: 'Debe seleccionar un rol válido', trigger: 'change' },
  ],
})

// Computed
const filteredUsers = computed(() => {
  // Ahora que la paginación y filtrado se hace del lado del servidor,
  // simplemente retornamos los usuarios tal como vienen del backend
  return Array.isArray(users.value) ? users.value : []
})

// Métodos
const getRoleTagType = (roleName: string) => {
  const types: { [key: string]: string } = {
    administrador: 'danger',
    vendedor: 'warning',
    cliente: 'info',
  }
  return types[roleName.toLowerCase()] || 'info'
}

const getRoleName = (user: User) => {
  const role = roles.value.find((r) => r.id === user.rolId)
  return role?.name || 'Sin rol'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await UserService.getUsers({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
      roleId: roleFilter.value || undefined,
      isActive: statusFilter.value !== null ? statusFilter.value : undefined,
    }) // Los usuarios están en response.response.users según la estructura real del backend
    if (
      response &&
      response.response &&
      response.response.users &&
      Array.isArray(response.response.users)
    ) {
      users.value = response.response.users
      // Usar count de response o totalItems de pagination como fallback
      totalUsers.value = response.response.count || response.pagination?.totalItems || 0
    } else {
      console.warn('⚠️ La respuesta no tiene la estructura esperada:', response)
      users.value = []
      totalUsers.value = 0
    }
  } catch (error) {
    console.error('❌ Error al cargar usuarios:', error)
    ElMessage.error('Error al cargar usuarios')
    users.value = []
    totalUsers.value = 0
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    roles.value = await RoleService.getActiveRoles()
  } catch (error) {
    console.error('❌ Error al cargar roles:', error)
    ElMessage.error('Error al cargar roles')
  }
}

const editUser = (user: User) => {
  isEditing.value = true
  userForm.id = user.id
  userForm.name = user.name
  userForm.lastname = user.lastname
  userForm.email = user.email
  userForm.password = ''
  userForm.rolId = user.rolId
  showCreateDialog.value = true
}

const deleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `¿Estás seguro de eliminar al usuario "${user.name} ${user.lastname}"?`,
      'Confirmar eliminación',
      {
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        type: 'warning',
      },
    )

    loading.value = true
    await UserService.deleteUser(user.id)
    ElMessage.success('Usuario eliminado exitosamente')
    await fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting user:', error)
      ElMessage.error('Error al eliminar usuario')
    }
  } finally {
    loading.value = false
  }
}

const saveUser = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true

        if (isEditing.value) {
          const updateData: UpdateUserDto = {
            id: userForm.id,
            name: userForm.name,
            lastname: userForm.lastname,
            email: userForm.email,
            rolId: userForm.rolId || undefined, // Corregido para enviar rol_id
          }

          if (userForm.password) {
            updateData.password = userForm.password
          }

          await UserService.updateUser(updateData)
          ElMessage.success('Usuario actualizado exitosamente')
        } else {
          const createData: CreateUserDto = {
            name: userForm.name,
            lastname: userForm.lastname,
            email: userForm.email,
            password: userForm.password,
            rolId: userForm.rolId || 3, // Corregido para enviar rol_id
          }

          await UserService.createUser(createData)
          ElMessage.success('Usuario creado exitosamente')
        }

        resetForm()
        showCreateDialog.value = false
        await fetchUsers()
      } catch (error) {
        console.error('Error saving user:', error)
        ElMessage.error('Error al guardar usuario')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = () => {
  userForm.id = 0
  userForm.name = ''
  userForm.lastname = ''
  userForm.email = ''
  userForm.password = ''
  userForm.rolId = null
  isEditing.value = false
  userFormRef.value?.resetFields()
}

const applyFilters = () => {
  currentPage.value = 1 // Reiniciar a la primera página cuando se aplican filtros
  fetchUsers()
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = null
  roleFilter.value = null
  currentPage.value = 1
  fetchUsers()
}

const openCreateDialog = () => {
  resetForm()
  showCreateDialog.value = true
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  applyFilters()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchUsers()
}

// Inicialización
onMounted(async () => {
  await Promise.all([fetchUsers(), fetchRoles()])
})
</script>
<style scoped>
.users-page {
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

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.user-email {
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
