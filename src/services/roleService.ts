// Servicio para gestión de roles - Conectado al backend SOA-USERS
import apiClient from './api'
import type { Role, CreateRoleDto, UpdateRoleDto } from '@/types/api'

export class RoleService {
  private static readonly BASE_PATH = '/roles'

  /**
   * Obtener todos los roles
   * @param activeOnly - Si es true, solo obtiene roles activos
   */
  static async getRoles(activeOnly: boolean = false): Promise<Role[]> {
    const params = activeOnly ? { active: 'true' } : {}
    const response = await apiClient.get(this.BASE_PATH, { params })

    console.log('📥 Respuesta getRoles:', response.data)

    // El backend devuelve directamente el array de roles
    return Array.isArray(response.data) ? response.data : []
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
    return this.getRoles(true)
  }
}
