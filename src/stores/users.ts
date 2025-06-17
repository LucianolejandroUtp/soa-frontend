// Store de Pinia para gestión de usuarios
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UserService } from '@/services/userService'
import { RoleService } from '@/services/roleService'
import type {
  User,
  Role,
  CreateUserDto,
  UpdateUserDto,
  PaginationParams,
  UserFilters,
} from '@/types/api'

export const useUserStore = defineStore('users', () => {
  // Estado
  const users = ref<User[]>([])
  const roles = ref<Role[]>([])
  const loading = ref(false)
  const currentUser = ref<User | null>(null)

  // Paginación
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  // Filtros
  const filters = ref<UserFilters>({
    search: '',
    roleId: null,
    isActive: null,
  })

  // Computed
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  const hasUsers = computed(() => users.value.length > 0)

  const activeUsers = computed(() => users.value.filter((user) => user.isActive && !user.deleted))

  // Acciones
  const fetchUsers = async (params?: PaginationParams) => {
    loading.value = true
    try {
      const searchParams = {
        page: currentPage.value,
        limit: pageSize.value,
        search: filters.value.search,
        roleId: filters.value.roleId,
        isActive: filters.value.isActive,
        ...params,
      }

      const response = await UserService.getUsers(searchParams)
      // Manejar la estructura real del backend
      users.value = Array.isArray(response.response?.users) ? response.response.users : []
      total.value = response.response?.count || response.pagination?.totalItems || 0
      currentPage.value = response.pagination?.currentPage || 1
    } catch (error) {
      console.error('Error fetching users:', error)
      ElMessage.error('Error al cargar usuarios')
      // Asegurar que users sea un array vacío en caso de error
      users.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  const fetchRoles = async () => {
    try {
      roles.value = await RoleService.getRoles()
    } catch (error) {
      console.error('Error fetching roles:', error)
      ElMessage.error('Error al cargar roles')
    }
  }

  const createUser = async (userData: CreateUserDto) => {
    loading.value = true
    try {
      const newUser = await UserService.createUser(userData)

      // Ir a la primera página para ver el nuevo usuario (ya que se agrega al inicio)
      currentPage.value = 1

      // Refetch toda la lista para obtener datos completos con relaciones
      await fetchUsers()

      ElMessage.success('Usuario creado exitosamente')
      return newUser
    } catch (error) {
      console.error('Error creating user:', error)
      ElMessage.error('Error al crear usuario')
      throw error
    } finally {
      loading.value = false
    }
  }
  const updateUser = async (userData: UpdateUserDto) => {
    loading.value = true
    try {
      const updatedUser = await UserService.updateUser(userData)

      // Refetch para obtener datos completos con relaciones actualizadas
      await fetchUsers()

      ElMessage.success('Usuario actualizado exitosamente')
      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      ElMessage.error('Error al actualizar usuario')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: number) => {
    loading.value = true
    try {
      await UserService.deleteUser(id)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index].deleted = true
      }
      total.value -= 1
      ElMessage.success('Usuario eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting user:', error)
      ElMessage.error('Error al eliminar usuario')
      throw error
    } finally {
      loading.value = false
    }
  }

  const setCurrentUser = async (id: number) => {
    try {
      currentUser.value = await UserService.getUserById(id)
    } catch (error) {
      console.error('Error fetching user:', error)
      ElMessage.error('Error al cargar usuario')
    }
  }
  const updateFilters = (newFilters: Partial<UserFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
    currentPage.value = 1 // Reset página al filtrar
    fetchUsers()
  }

  const setFilters = (newFilters: Partial<UserFilters>) => {
    // Normalizar undefined a null para filtros booleanos y numéricos
    const normalizedFilters = { ...newFilters }

    if ('isActive' in normalizedFilters && normalizedFilters.isActive === undefined) {
      normalizedFilters.isActive = null
    }

    if ('roleId' in normalizedFilters && normalizedFilters.roleId === undefined) {
      normalizedFilters.roleId = null
    }

    filters.value = { ...filters.value, ...normalizedFilters }
  }

  const changePage = (page: number) => {
    currentPage.value = page
    fetchUsers()
  }

  const changePageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    fetchUsers()
  }

  const resetFilters = () => {
    filters.value = {
      search: '',
      roleId: null,
      isActive: null,
    }
    currentPage.value = 1
    fetchUsers()
  }

  // Inicialización
  const initialize = async () => {
    await Promise.all([fetchUsers(), fetchRoles()])
  }

  return {
    // Estado
    users,
    roles,
    loading,
    currentUser,
    currentPage,
    pageSize,
    total,
    filters,

    // Computed
    totalPages,
    hasUsers,
    activeUsers, // Acciones
    fetchUsers,
    fetchRoles,
    createUser,
    updateUser,
    deleteUser,
    setCurrentUser,
    updateFilters,
    setFilters,
    changePage,
    changePageSize,
    resetFilters,
    initialize,
  }
})
