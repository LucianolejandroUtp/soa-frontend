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
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="statusFilter" placeholder="Estado" clearable>
            <el-option label="Activo" value="active" />
            <el-option label="Inactivo" value="inactive" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="roleFilter" placeholder="Rol" clearable>
            <el-option label="Admin" value="admin" />
            <el-option label="Usuario" value="user" />
            <el-option label="Editor" value="editor" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="applyFilters">Filtrar</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Tabla de usuarios -->
    <el-card>
      <el-table :data="filteredUsers" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />

        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column label="Usuario" width="200">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="40" :src="scope.row.avatar" />
              <div class="user-details">
                <div class="user-name">{{ scope.row.name }}</div>
                <div class="user-email">{{ scope.row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="role" label="Rol" width="120">
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.role)">
              {{ scope.row.role }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="Estado" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? 'Activo' : 'Inactivo' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="Fecha Registro" width="150" />

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
          :total="totalUsers"
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
    >
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="100px">
        <el-form-item label="Nombre" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input v-model="userForm.email" type="email" />
        </el-form-item>

        <el-form-item label="Rol" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="Admin" value="admin" />
            <el-option label="Usuario" value="user" />
            <el-option label="Editor" value="editor" />
          </el-select>
        </el-form-item>

        <el-form-item label="Estado" prop="status">
          <el-switch
            v-model="userForm.status"
            active-text="Activo"
            inactive-text="Inactivo"
            active-value="active"
            inactive-value="inactive"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">Cancelar</el-button>
          <el-button type="primary" @click="saveUser">
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  avatar: string
  createdAt: string
}

// Estado reactivo
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showCreateDialog = ref(false)
const isEditing = ref(false)
const userFormRef = ref()

// Datos de ejemplo
const users = ref<User[]>([
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    createdAt: '2025-01-15',
  },
  {
    id: 2,
    name: 'María García',
    email: 'maria@ejemplo.com',
    role: 'user',
    status: 'active',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    createdAt: '2025-02-10',
  },
  {
    id: 3,
    name: 'Carlos López',
    email: 'carlos@ejemplo.com',
    role: 'editor',
    status: 'inactive',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    createdAt: '2025-03-05',
  },
])

// Formulario para crear/editar usuario
const userForm = reactive({
  id: 0,
  name: '',
  email: '',
  role: 'user',
  status: 'active',
})

// Reglas de validación
const userRules = {
  name: [{ required: true, message: 'El nombre es requerido', trigger: 'blur' }],
  email: [
    { required: true, message: 'El email es requerido', trigger: 'blur' },
    { type: 'email', message: 'Formato de email inválido', trigger: 'blur' },
  ],
  role: [{ required: true, message: 'El rol es requerido', trigger: 'change' }],
}

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    filtered = filtered.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter((user) => user.status === statusFilter.value)
  }

  if (roleFilter.value) {
    filtered = filtered.filter((user) => user.role === roleFilter.value)
  }

  return filtered
})

// Computed para el total de usuarios (sin side effects)
const totalUsers = computed(() => filteredUsers.value.length)

// Métodos
const getRoleTagType = (role: string) => {
  const types: { [key: string]: string } = {
    admin: 'danger',
    editor: 'warning',
    user: 'info',
  }
  return types[role] || 'info'
}

const applyFilters = () => {
  // Los filtros se aplican automáticamente por computed
  ElMessage.success('Filtros aplicados')
}

const editUser = (user: User) => {
  isEditing.value = true
  Object.assign(userForm, user)
  showCreateDialog.value = true
}

const deleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `¿Estás seguro de eliminar al usuario ${user.name}?`,
      'Confirmar eliminación',
      {
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        type: 'warning',
      },
    )

    const index = users.value.findIndex((u) => u.id === user.id)
    if (index > -1) {
      users.value.splice(index, 1)
      ElMessage.success('Usuario eliminado correctamente')
    }
  } catch {
    ElMessage.info('Eliminación cancelada')
  }
}

const saveUser = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate((valid: boolean) => {
    if (valid) {
      if (isEditing.value) {
        // Actualizar usuario existente
        const index = users.value.findIndex((u) => u.id === userForm.id)
        if (index > -1) {
          users.value[index] = {
            ...userForm,
            avatar: users.value[index].avatar,
            createdAt: users.value[index].createdAt,
          }
        }
        ElMessage.success('Usuario actualizado correctamente')
      } else {
        // Crear nuevo usuario
        const newUser: User = {
          ...userForm,
          id: Date.now(),
          avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          createdAt: new Date().toISOString().split('T')[0],
        }
        users.value.push(newUser)
        ElMessage.success('Usuario creado correctamente')
      }

      resetForm()
      showCreateDialog.value = false
    }
  })
}

const resetForm = () => {
  Object.assign(userForm, {
    id: 0,
    name: '',
    email: '',
    role: 'user',
    status: 'active',
  })
  isEditing.value = false
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}
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
