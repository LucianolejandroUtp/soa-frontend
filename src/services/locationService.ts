import { apiClient } from './api'
import type {
  Location,
  CreateLocationDto,
  UpdateLocationDto,
  LocationPaginationParams,
  EventPaginatedResponse,
} from '@/types/api'

export class LocationService {
  private static readonly BASE_PATH = '/events/locations'

  /**
   * Obtener todas las ubicaciones (incluidas inactivas)
   */
  static async getAllLocations(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>(this.BASE_PATH)
    return response.data
  }

  /**
   * Obtener solo ubicaciones activas
   */
  static async getActiveLocations(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>(`${this.BASE_PATH}/active`)
    return response.data
  }
  /**
   * Obtener ubicaciones con paginación
   * CORREGIDO: Usar GET con query params según especificación
   */
  static async getLocationsPaginated(
    params: LocationPaginationParams,
  ): Promise<EventPaginatedResponse<Location>> {
    // Construir parámetros excluyendo valores undefined
    const queryParams: Record<string, string | number> = {}

    if (params.page !== undefined) {
      queryParams.page = params.page
    }

    if (params.items !== undefined) {
      queryParams.limit = params.items // Usar 'limit' según especificación
    }

    console.log('🔍 [LocationService] Solicitando ubicaciones paginadas:', queryParams)

    const response = await apiClient.get<EventPaginatedResponse<Location>>(
      `${this.BASE_PATH}/paginated`,
      {
        params: queryParams,
      },
    )

    console.log('📥 [LocationService] Respuesta recibida:', response.data)

    return response.data
  }

  /**
   * Obtener ubicación por ID
   */
  static async getLocationById(id: number): Promise<Location> {
    const response = await apiClient.get<Location>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  /**
   * Obtener ubicación por nombre
   */
  static async getLocationByName(name: string): Promise<Location> {
    const response = await apiClient.get<Location>(
      `${this.BASE_PATH}/name/${encodeURIComponent(name)}`,
    )
    return response.data
  }

  /**
   * Crear nueva ubicación
   */
  static async createLocation(locationData: CreateLocationDto): Promise<Location> {
    const response = await apiClient.post<Location>(this.BASE_PATH, locationData)
    return response.data
  }

  /**
   * Actualizar ubicación existente
   */
  static async updateLocation(locationData: UpdateLocationDto): Promise<Location> {
    const response = await apiClient.put<Location>(
      `${this.BASE_PATH}/${locationData.id}`,
      locationData,
    )
    return response.data
  }

  /**
   * Eliminar ubicación
   */
  static async deleteLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  /**
   * Activar ubicación
   */
  static async activateLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}/activate`)
    return response.data
  }

  /**
   * Desactivar ubicación
   */
  static async deactivateLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}/deactivate`)
    return response.data
  }
}
