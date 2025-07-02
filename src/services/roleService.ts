// Servicio para gestión de roles - Conectado al backend SOA-USERS
import { apiClient } from './api'
import type { Role, CreateRoleDto, UpdateRoleDto } from '@/types/api'

export class RoleService {
  private static readonly BASE_PATH = '/roles'
  /**
   * Obtener todos los roles con paginación
   * @param params - Parámetros de paginación y filtros
   */
  static async getRoles(
    params: {
      page?: number
      limit?: number
      search?: string
      activeOnly?: boolean
    } = {},
  ): Promise<{ roles: Role[]; total: number }> {
    const { page = 1, limit = 10, search, activeOnly = false } = params

    const queryParams: Record<string, string | number | boolean> = {
      page,
      items: limit,
    }

    if (search && search.trim()) {
      queryParams.search = search.trim()
    }

    if (activeOnly) {
      queryParams.active = 'true'
    }

    console.log('🔍 [roleService] Haciendo petición GET a:', this.BASE_PATH)
    console.log('🔍 [roleService] Parámetros enviados:', queryParams)

    const response = await apiClient.get(this.BASE_PATH, { params: queryParams })

    console.log('📥 [roleService] Respuesta completa del backend:', response)
    console.log('📥 [roleService] Status de respuesta:', response.status)
    console.log('📥 [roleService] Data de respuesta:', response.data)

    // Si el backend devuelve directamente el array (sin paginación)
    if (Array.isArray(response.data)) {
      return {
        roles: response.data,
        total: response.data.length,
      }
    }

    // Si el backend devuelve con estructura de paginación
    if (response.data && response.data.response && Array.isArray(response.data.response.roles)) {
      return {
        roles: response.data.response.roles,
        total: response.data.response.total || response.data.response.roles.length,
      }
    }

    return { roles: [], total: 0 }
  }

  /**
   * Obtener rol por ID
   */
  static async getRoleById(id: number): Promise<Role> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`)

    console.log(`📥 Respuesta getRoleById(${id}):`, response.data)

    return response.data
  }

  /**
   * Crear nuevo rol
   */
  static async createRole(roleData: CreateRoleDto): Promise<Role> {
    console.log('📤 Creando rol:', roleData)

    const response = await apiClient.post(this.BASE_PATH, roleData)

    console.log('📥 Rol creado:', response.data)

    return response.data
  }

  /**
   * Actualizar rol existente
   */
  static async updateRole(id: number, roleData: UpdateRoleDto): Promise<Role> {
    console.log(`📤 Actualizando rol ${id}:`, roleData)

    const response = await apiClient.put(`${this.BASE_PATH}/${id}`, roleData)

    console.log('📥 Rol actualizado:', response.data)

    return response.data
  }

  /**
   * Eliminar rol (eliminación física)
   */
  static async deleteRole(id: number): Promise<void> {
    console.log(`🗑️ Eliminando rol ${id}`)

    await apiClient.delete(`${this.BASE_PATH}/${id}`)

    console.log(`✅ Rol ${id} eliminado`)
  }

  /**
   * Desactivar rol
   */
  static async deactivateRole(id: number): Promise<void> {
    console.log(`🔒 Desactivando rol ${id}`)

    await apiClient.post(`${this.BASE_PATH}/${id}/deactivate`)

    console.log(`✅ Rol ${id} desactivado`)
  }

  /**
   * Activar rol
   */
  static async activateRole(id: number): Promise<void> {
    console.log(`🔓 Activando rol ${id}`)

    await apiClient.post(`${this.BASE_PATH}/${id}/activate`)

    console.log(`✅ Rol ${id} activado`)
  }
  /**
   * Obtener solo roles activos (método de conveniencia)
   */
  static async getActiveRoles(): Promise<Role[]> {
    const result = await this.getRoles({ activeOnly: true, limit: 100 })
    return result.roles
  }
}
