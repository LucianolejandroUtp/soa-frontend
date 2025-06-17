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

  // Constantes para roles del sistema (basadas en la base de datos real)
  // Nota: Estos valores coinciden con la tabla soa.tbl_roles en la BD
  private static readonly ROLE_IDS = {
    ADMIN: 1, // ID del rol "Administrador"
    VENDEDOR: 2, // ID del rol "Vendedor"
    CLIENTE: 3, // ID del rol "Cliente" - usuarios que se registran públicamente
  } as const /**
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
  } /**
   * Buscar usuarios por término
   */
  static async searchUsers(searchTerm: string): Promise<User[]> {
    const response = await this.getUsers({ search: searchTerm, limit: 50 })
    return response.response?.users || []
  } /**
   * Registrar un nuevo usuario (wrapper de createUser para registro público)
   * Asigna automáticamente el rol de "cliente" al usuario registrado
   */
  static async register(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<User> {
    const createUserDto: CreateUserDto = {
      name: userData.firstName,
      lastname: userData.lastName,
      email: userData.email,
      password: userData.password,
      rolId: this.ROLE_IDS.CLIENTE, // Asigna específicamente el rol de "cliente"
    }

    console.log('📤 Registrando nuevo usuario como CLIENTE:', {
      ...createUserDto,
      password: '[HIDDEN]',
      rolId: `${createUserDto.rolId} (CLIENTE)`,
    })

    try {
      const user = await this.createUser(createUserDto)
      console.log('✅ Usuario registrado exitosamente como cliente:', user)
      return user
    } catch (error) {
      console.error('❌ Error en registro:', error)
      throw error
    }
  } /**
   * Obtener los IDs de roles disponibles
   */
  static getRoleIds() {
    return this.ROLE_IDS
  }

  /**
   * Obtener el nombre del rol por ID
   */
  static getRoleName(roleId: number): string {
    switch (roleId) {
      case this.ROLE_IDS.ADMIN:
        return 'Administrador'
      case this.ROLE_IDS.VENDEDOR:
        return 'Vendedor'
      case this.ROLE_IDS.CLIENTE:
        return 'Cliente'
      default:
        return 'Rol desconocido'
    }
  }

  /**
   * Autenticar usuario (login)
   */
  static async login(credentials: {
    email: string
    password: string
  }): Promise<{ user: User; success: boolean }> {
    try {
      // TODO: Implementar endpoint de autenticación real en el backend
      // Por ahora, simulamos validando que el usuario existe
      const users = await this.getUsers({ search: credentials.email, limit: 1 })

      if (users.response?.users && users.response.users.length > 0) {
        const user = users.response.users[0]

        // TODO: En un entorno real, el backend validaría la contraseña
        console.log('✅ Login simulado exitoso para:', user.email)
        return { user, success: true }
      } else {
        throw new Error('Usuario no encontrado')
      }
    } catch (error) {
      console.error('❌ Error en login:', error)
      throw error
    }
  }
}
