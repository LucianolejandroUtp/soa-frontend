import { apiClient } from './api'
import type {
  Location,
  CreateLocationDto,
  UpdateLocationDto,
  LocationPaginationParams,
  EventPaginatedResponse,
} from '@/types/api'

export class LocationService {
  /**
   * Obtener todas las ubicaciones (incluidas inactivas)
   */
  static async getAllLocations(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>('/locations')
    return response.data
  }

  /**
   * Obtener solo ubicaciones activas
   */
  static async getActiveLocations(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>('/locations/active')
    return response.data
  }
  /**
   * Obtener ubicaciones con paginación
   */
  static async getLocationsPaginated(
    params: LocationPaginationParams,
  ): Promise<EventPaginatedResponse<Location>> {
    // Construir parámetros excluyendo valores undefined
    const queryParams: Record<string, string | number> = {}

    if (params.page !== undefined) {
      // SOA-BUS usa paginación basada en 1, no en 0
      queryParams.page = params.page
    }

    if (params.items !== undefined) {
      queryParams.items = params.items
    }
    
    console.log('🔍 [LocationService] Solicitando ubicaciones paginadas:', queryParams)
    
    const response = await apiClient.get<EventPaginatedResponse<Location>>(
      '/locations/paginated',
      {
        params: queryParams,
      },
    )

    console.log('📥 [LocationService] Respuesta recibida:', response.data)

    // Ajustar el currentPage si es necesario para la UI
    if (response.data.pagination) {
      // Si el backend devuelve basado en 0, ajustar para UI basada en 1
      // response.data.pagination.currentPage = response.data.pagination.currentPage + 1
    }

    return response.data
  }

  /**
   * Obtener ubicación por ID
   */
  static async getLocationById(id: number): Promise<Location> {
    const response = await apiClient.get<Location>(`/locations/${id}`)
    return response.data
  }

  /**
   * Obtener ubicación por nombre
   */
  static async getLocationByName(name: string): Promise<Location> {
    const response = await apiClient.get<Location>(
      `/locations/name/${encodeURIComponent(name)}`,
    )
    return response.data
  }

  /**
   * Crear nueva ubicación
   */
  static async createLocation(locationData: CreateLocationDto): Promise<Location> {
    const response = await apiClient.post<Location>('/locations', locationData)
    return response.data
  }

  /**
   * Actualizar ubicación existente
   */
  static async updateLocation(locationData: UpdateLocationDto): Promise<Location> {
    const response = await apiClient.put<Location>(
      `/locations/${locationData.id}`,
      locationData,
    )
    return response.data
  }

  /**
   * Eliminar ubicación
   */
  static async deleteLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/locations/${id}`)
    return response.data
  }

  /**
   * Activar ubicación
   */
  static async activateLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`/locations/${id}/activate`)
    return response.data
  }

  /**
   * Desactivar ubicación
   */
  static async deactivateLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`/locations/${id}/deactivate`)
    return response.data
  }
}
