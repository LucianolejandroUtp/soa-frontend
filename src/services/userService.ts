// Servicio para gestión de usuarios - Conectado al backend SOA-USERS
import apiClient from './api'
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  PaginationParams,
  PaginatedResponse,
} from '@/types/api'

export class UserService {
  private static readonly BASE_PATH = '/users' /**
   * Obtener usuarios con paginación
   */
  static async getUsers(params: PaginationParams = {}): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 10, search, roleId, isActive } = params

    // Construir parámetros, excluyendo valores nulos/undefined
    const queryParams: Record<string, string | number | boolean> = {
      page,
      items: limit, // El backend espera 'items' en lugar de 'limit'
    }

    // Añadir parámetros de filtro solo si tienen valor
    if (search && search.trim()) {
      queryParams.search = search.trim()
    }
    if (roleId !== null && roleId !== undefined) {
      queryParams.roleId = roleId
    }
    if (isActive !== null && isActive !== undefined) {
      queryParams.isActive = isActive
    }
    const response = await apiClient.get(this.BASE_PATH, {
      params: queryParams,
    })

    return response.data
  }

  /**
   * Obtener usuario por ID
   */
  static async getUserById(id: number): Promise<User> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`)
    return response.data
  }
  /**
   * Crear nuevo usuario
   */
  static async createUser(userData: CreateUserDto): Promise<User> {
    console.log('📤 Enviando al backend:', userData)
    const response = await apiClient.post(this.BASE_PATH, userData)
    console.log('📥 Respuesta del backend:', response.data)
    return response.data
  }

  /**
   * Actualizar usuario existente
   */
  static async updateUser(userData: UpdateUserDto): Promise<User> {
    const response = await apiClient.put(this.BASE_PATH, userData)
    return response.data
  }

  /**
   * Eliminar usuario (borrado lógico)
   */
  static async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`)
  }
  /**
   * Buscar usuarios por término
   */
  static async searchUsers(searchTerm: string): Promise<User[]> {
    const response = await this.getUsers({ search: searchTerm, limit: 50 })
    return response.response?.users || []
  }
}
