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
  private static readonly BASE_PATH = '/users'
  /**
   * Obtener usuarios con paginación
   */
  static async getUsers(params: PaginationParams = {}): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 10 } = params

    const response = await apiClient.get(this.BASE_PATH, {
      params: {
        page,
        items: limit, // El backend espera 'items' en lugar de 'limit'
      },
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
    const response = await apiClient.post(this.BASE_PATH, userData)
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
