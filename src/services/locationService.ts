import { apiClientEvents } from './api'
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
    const response = await apiClientEvents.get<Location[]>('/locations')
    return response.data
  }

  /**
   * Obtener solo ubicaciones activas
   */
  static async getActiveLocations(): Promise<Location[]> {
    const response = await apiClientEvents.get<Location[]>('/locations/active')
    return response.data
  }

  /**
   * Obtener ubicaciones con paginación
   */
  static async getLocationsPaginated(
    params: LocationPaginationParams,
  ): Promise<EventPaginatedResponse<Location>> {
    const queryParams = new URLSearchParams()

    // La API de eventos usa page basado en 0, pero mostramos basado en 1 en la UI
    if (params.page !== undefined) {
      queryParams.append('page', (params.page - 1).toString())
    }

    if (params.items !== undefined) {
      queryParams.append('items', params.items.toString())
    }

    const response = await apiClientEvents.get<EventPaginatedResponse<Location>>(
      `/locations/paginated?${queryParams.toString()}`,
    )

    // Ajustar el currentPage para que sea basado en 1 para la UI
    if (response.data.pagination) {
      response.data.pagination.currentPage = response.data.pagination.currentPage + 1
    }

    return response.data
  }

  /**
   * Obtener ubicación por ID
   */
  static async getLocationById(id: number): Promise<Location> {
    const response = await apiClientEvents.get<Location>(`/locations/${id}`)
    return response.data
  }

  /**
   * Obtener ubicación por nombre
   */
  static async getLocationByName(name: string): Promise<Location> {
    const response = await apiClientEvents.get<Location>(
      `/locations/name/${encodeURIComponent(name)}`,
    )
    return response.data
  }

  /**
   * Crear nueva ubicación
   */
  static async createLocation(locationData: CreateLocationDto): Promise<Location> {
    const response = await apiClientEvents.post<Location>('/locations', locationData)
    return response.data
  }

  /**
   * Actualizar ubicación existente
   */
  static async updateLocation(locationData: UpdateLocationDto): Promise<Location> {
    const response = await apiClientEvents.put<Location>(
      `/locations/${locationData.id}`,
      locationData,
    )
    return response.data
  }

  /**
   * Eliminar ubicación
   */
  static async deleteLocation(id: number): Promise<{ message: string }> {
    const response = await apiClientEvents.delete<{ message: string }>(`/locations/${id}`)
    return response.data
  }

  /**
   * Activar ubicación
   */
  static async activateLocation(id: number): Promise<{ message: string }> {
    const response = await apiClientEvents.patch<{ message: string }>(`/locations/${id}/activate`)
    return response.data
  }

  /**
   * Desactivar ubicación
   */
  static async deactivateLocation(id: number): Promise<{ message: string }> {
    const response = await apiClientEvents.patch<{ message: string }>(`/locations/${id}/deactivate`)
    return response.data
  }
}
