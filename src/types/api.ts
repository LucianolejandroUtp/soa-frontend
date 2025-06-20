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

// ===== TIPOS PARA SOA-EVENTS =====

// Eventos
export interface Event {
  id: number
  name: string
  description: string
  startDate: string // ISO date string
  endDate: string // ISO date string
  saleStart: string // ISO date string
  saleEnd: string // ISO date string
  isActive: boolean
  deleted: boolean
  createdAt: string
  updatedAt: string
  eventLocations?: EventLocation[]
}

export interface CreateEventDto {
  name: string
  description: string
  start_date: string // Backend espera snake_case
  end_date: string
  sale_start: string
  sale_end: string
}

export interface UpdateEventDto {
  event_id: number
  name?: string
  description?: string
  start_date?: string
  end_date?: string
  sale_start?: string
  sale_end?: string
  is_active?: boolean
  deleted?: boolean
}

// Ubicaciones
export interface Location {
  id: number
  name: string
  capacity: number
  isActive: boolean
  deleted: boolean
  createdAt: string
  updatedAt: string
  eventLocations?: EventLocation[]
}

export interface CreateLocationDto {
  name: string
  capacity: number
}

export interface UpdateLocationDto {
  id: number
  name?: string
  capacity?: number
  is_active?: boolean
  deleted?: boolean
}

// Relación Evento-Ubicación (estructura completa según documentación)
export interface EventLocation {
  id: number
  name: string
  price: number
  isActive: boolean
  deleted: boolean
  createdAt: string
  updatedAt: string
  event: {
    id: number
    name: string
  }
  location: {
    id: number
    name: string
  }
}

// Relación Evento-Ubicación (estructura actual de la API)
export interface EventLocationBasic {
  id: number
  name: string
  price: string // La API devuelve price como string
  isActive: boolean
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEventLocationDto {
  event_id: number
  location_id: number
  name: string
  price: number
}

export interface UpdateEventLocationDto {
  id: number
  event_id?: number
  location_id?: number
  name?: string
  price?: number
  is_active?: boolean
  deleted?: boolean
}

// Parámetros de paginación para eventos
export interface EventPaginationParams {
  page?: number
  items?: number
}

export interface LocationPaginationParams {
  page?: number
  items?: number
}

// Respuesta paginada para eventos
export interface EventPaginatedResponse<T> {
  response: T[]
  pagination: {
    currentPage: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Filtros para eventos (para futuras implementaciones)
export interface EventFilters {
  search?: string
  startDate?: string
  endDate?: string
  isActive?: boolean | null
}

export interface LocationFilters {
  search?: string
  capacity?: number
  isActive?: boolean | null
}
