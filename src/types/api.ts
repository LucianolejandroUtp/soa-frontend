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
  rolId: number // Backend espera rol_id con underscore
}

export interface UpdateUserDto {
  id: number
  name?: string
  lastname?: string
  email?: string
  password?: string
  rolId?: number // Backend espera rol_id con underscore
  isActive?: boolean
}

// DTOs para Roles
export interface CreateRoleDto {
  name: string
}

export interface UpdateRoleDto {
  name?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  roleId?: number | null
  isActive?: boolean | null
}

export interface PaginatedResponse<T> {
  response: {
    users: T[] // Los usuarios están anidados dentro de response.users
    count: number
  }
  pagination: {
    currentPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    itemsPerPage: number
    totalItems: number
    totalPages: number
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
