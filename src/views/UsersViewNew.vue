<template>
  <div class="users-page">
    <!-- Header con botón de nuevo usuario -->
    <div class="page-header">
      <h2>Gestión de Usuarios</h2>
      <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
        Nuevo Usuario
      </el-button>
    </div>

    <!-- Filtros y búsqueda -->
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="Buscar usuarios..."
            :prefix-icon="Search"
            clearable
            @clear="applyFilters"
            @keyup.enter="applyFilters"
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="statusFilter" placeholder="Estado" clearable @change="applyFilters">
            <el-option label="Activo" :value="true" />
            <el-option label="Inactivo" :value="false" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="roleFilter" placeholder="Rol" clearable @change="applyFilters">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="applyFilters">Filtrar</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Tabla de usuarios -->
    <el-card>
      <el-table
        :data="users"
        style="width: 100%"
        v-loading="loading"
        empty-text="No hay usuarios disponibles"
      >
        <el-table-column type="selection" width="55" />

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

        <el-table-column label="Rol" width="120">
          <template #default="scope">
            <el-tag :type="getRoleTagType(getRoleName(scope.row))">
              {{ getRoleName(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Estado" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
              {{ scope.row.isActive ? 'Activo' : 'Inactivo' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Fecha Registro" width="150">
          <template #default="scope">
            {{ new Date(scope.row.createdAt).toLocaleDateString() }}
          </template>
        </el-table-column>

        <el-table-column label="Acciones" width="180">
          <template #default="scope">
            <el-button size="small" type="primary" :icon="Edit" @click="editUser(scope.row)">
              Editar
            </el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="deleteUser(scope.row)">
              Eliminar
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Paginación -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Dialog para crear/editar usuario -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? 'Editar Usuario' : 'Nuevo Usuario'"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="120px">
        <el-form-item label="Nombre" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>

        <el-form-item label="Apellido" prop="lastname">
          <el-input v-model="userForm.lastname" />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input v-model="userForm.email" type="email" />
        </el-form-item>

        <el-form-item label="Contraseña" prop="password" :required="!isEditing">
          <el-input
            v-model="userForm.password"
            type="password"
            :placeholder="isEditing ? 'Dejar vacío para mantener actual' : 'Contraseña'"
            show-password
          />
        </el-form-item>

        <el-form-item label="Rol" prop="rolId">
          <el-select v-model="userForm.rolId" style="width: 100%">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">Cancelar</el-button>
          <el-button type="primary" @click="saveUser" :loading="loading">
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/users'
import type { User, CreateUserDto, UpdateUserDto } from '@/types/api'

// Store
const userStore = useUserStore()

// Estado local para formularios
const showCreateDialog = ref(false)
const isEditing = ref(false)
const userFormRef = ref()

// Filtros locales
const statusFilter = ref<boolean | null>(null)
const roleFilter = ref<number | null>(null)

// Datos de formulario
const userForm = ref<CreateUserDto & { id?: number }>({
  name: '',
  lastname: '',
  email: '',
  password: '',
  rolId: 0,
})

// Reglas de validación
const userRules = computed(() => ({
  name: [{ required: true, message: 'El nombre es requerido', trigger: 'blur' }],
  lastname: [{ required: true, message: 'El apellido es requerido', trigger: 'blur' }],
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
  rolId: [{ required: true, message: 'El rol es requerido', trigger: 'change' }],
}))

// Computed properties del store
const users = computed(() => (userStore.users || []).filter((user) => !user.deleted))
const roles = computed(() =>
  (userStore.roles || []).filter((role) => role.isActive && !role.deleted),
)
const loading = computed(() => userStore.loading)
const currentPage = computed({
  get: () => userStore.currentPage,
  set: (value: number) => userStore.changePage(value),
})
const pageSize = computed({
  get: () => userStore.pageSize,
  set: (value: number) => userStore.changePageSize(value),
})
const total = computed(() => userStore.total)
const searchQuery = computed({
  get: () => userStore.filters.search,
  set: (value: string) => userStore.updateFilters({ search: value }),
})

// Métodos
const getRoleTagType = (roleName: string) => {
  const types: { [key: string]: string } = {
    admin: 'danger',
    administrator: 'danger',
    editor: 'warning',
    user: 'info',
    usuario: 'info',
  }
  return types[roleName.toLowerCase()] || 'info'
}

const getRoleName = (user: User) => {
  return user.rol?.name || 'Sin rol'
}

const editUser = (user: User) => {
  isEditing.value = true
  userForm.value = {
    id: user.id,
    name: user.name,
    lastname: user.lastname,
    email: user.email,
    password: '', // No mostramos la contraseña actual
    rolId: user.rolId,
  }
  showCreateDialog.value = true
}

const deleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `¿Estás seguro de eliminar al usuario ${user.name} ${user.lastname}?`,
      'Confirmar eliminación',
      {
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        type: 'warning',
      },
    )

    await userStore.deleteUser(user.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting user:', error)
    }
  }
}

const saveUser = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEditing.value && userForm.value.id) {
          // Preparar datos para actualización
          const updateData: UpdateUserDto = {
            id: userForm.value.id,
            name: userForm.value.name,
            lastname: userForm.value.lastname,
            email: userForm.value.email,
            rolId: userForm.value.rolId,
          }

          // Solo incluir contraseña si se proporcionó
          if (userForm.value.password) {
            updateData.password = userForm.value.password
          }

          await userStore.updateUser(updateData)
        } else {
          // Crear nuevo usuario
          const createData: CreateUserDto = {
            name: userForm.value.name,
            lastname: userForm.value.lastname,
            email: userForm.value.email,
            password: userForm.value.password,
            rolId: userForm.value.rolId,
          }

          await userStore.createUser(createData)
        }

        resetForm()
        showCreateDialog.value = false
      } catch (error) {
        console.error('Error saving user:', error)
      }
    }
  })
}

const resetForm = () => {
  userForm.value = {
    name: '',
    lastname: '',
    email: '',
    password: '',
    rolId: 0,
  }
  isEditing.value = false
  userFormRef.value?.resetFields()
}

const handleSizeChange = (val: number) => {
  userStore.changePageSize(val)
}

const handleCurrentChange = (val: number) => {
  userStore.changePage(val)
}

const applyFilters = () => {
  userStore.updateFilters({
    search: searchQuery.value,
    roleId: roleFilter.value,
    isActive: statusFilter.value,
  })
}

// Inicialización
onMounted(async () => {
  await userStore.initialize()
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
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  gap: 10px;
}
</style>
