// Tipos TypeScript basados en el backend SOA-USERS

export interface User {
  id: number
  name: string
  lastname: string
  email: string
  password?: string // Solo para creación
  rolId: number
  isActive: boolean
  deleted: boolean
  createdAt: string
  updatedAt: string
  rol?: Role
}

export interface Role {
  id: number
  name: string
  isActive: boolean
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  name: string
  lastname: string
  email: string
  password: string
  rolId: number
}

export interface UpdateUserDto {
  id: number
  name?: string
  lastname?: string
  email?: string
  password?: string
  rolId?: number
  isActive?: boolean
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface PaginatedResponse<T> {
  response: {
    users: T[]
    count: number
  }
  pagination: {
    currentPage: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Tipos para API Response
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

// Estados para formularios
export interface UserFormData {
  name: string
  lastname: string
  email: string
  password: string
  rolId: number | null
}

// Estados para filtros
export interface UserFilters {
  search: string
  roleId: number | null
  isActive: boolean | null
}
