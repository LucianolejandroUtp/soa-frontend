// Servicio para gestión de roles
import apiClient from './api'
import type { Role } from '@/types/api'

export class RoleService {
  private static readonly BASE_PATH = '/roles'

  /**
   * Obtener todos los roles activos
   */
  static async getRoles(): Promise<Role[]> {
    const response = await apiClient.get(this.BASE_PATH)
    return response.data
  }

  /**
   * Obtener rol por ID
   */
  static async getRoleById(id: number): Promise<Role> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  /**
   * Crear nuevo rol
   */
  static async createRole(roleData: { name: string }): Promise<Role> {
    const response = await apiClient.post(this.BASE_PATH, roleData)
    return response.data
  }
}
