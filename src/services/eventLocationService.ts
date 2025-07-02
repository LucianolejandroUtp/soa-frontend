import { apiClient } from './api'
import type {
  EventLocation,
  EventLocationBasic,
  CreateEventLocationDto,
  UpdateEventLocationDto,
  EventPaginationParams,
  EventPaginatedResponse,
} from '@/types/api'

export class EventLocationService {
  /**
   * Obtener todas las relaciones evento-ubicación
   */
  static async getAllEventLocations(): Promise<EventLocationBasic[]> {
    const response = await apiClient.get<EventLocationBasic[]>('/event-locations')
    return response.data
  }

  /**
   * Obtener relaciones evento-ubicación activas
   */
  static async getActiveEventLocations(): Promise<EventLocation[]> {
    const response = await apiClient.get<EventLocation[]>('/event-locations/active')
    return response.data
  }

  /**
   * Obtener relaciones evento-ubicación con paginación
   */
  static async getEventLocationsPaginated(
    params: EventPaginationParams,
  ): Promise<EventPaginatedResponse<EventLocation>> {
    const queryParams = new URLSearchParams()

    // SOA-BUS usa page basado en 1
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString())
    }

    if (params.items !== undefined) {
      queryParams.append('items', params.items.toString())
    }

    console.log('🔍 [EventLocationService] Solicitando relaciones paginadas:', {
      page: params.page,
      items: params.items
    })

    const response = await apiClient.get<EventPaginatedResponse<EventLocation>>(
      `/event-locations/paginated?${queryParams.toString()}`,
    )

    console.log('📥 [EventLocationService] Respuesta recibida:', response.data)

    // Ajustar el currentPage si es necesario para la UI
    if (response.data.pagination) {
      // Si el backend devuelve basado en 0, ajustar para UI basada en 1
      // response.data.pagination.currentPage = response.data.pagination.currentPage + 1
    }

    return response.data
  }

  /**
   * Obtener relación evento-ubicación por ID
   */
  static async getEventLocationById(id: number): Promise<EventLocation> {
    const response = await apiClient.get<EventLocation>(`/event-locations/${id}`)
    return response.data
  }

  /**
   * Obtener relaciones por evento
   */
  static async getEventLocationsByEvent(eventId: number): Promise<EventLocation[]> {
    const response = await apiClient.get<EventLocation[]>(`/event-locations/event/${eventId}`)
    return response.data
  }

  /**
   * Obtener relaciones por ubicación
   */
  static async getEventLocationsByLocation(locationId: number): Promise<EventLocation[]> {
    const response = await apiClient.get<EventLocation[]>(
      `/event-locations/location/${locationId}`,
    )
    return response.data
  }

  /**
   * Crear nueva relación evento-ubicación
   */
  static async createEventLocation(
    eventLocationData: CreateEventLocationDto,
  ): Promise<EventLocation> {
    const response = await apiClient.post<EventLocation>(
      '/event-locations',
      eventLocationData,
    )
    return response.data
  }

  /**
   * Actualizar relación evento-ubicación existente
   */
  static async updateEventLocation(
    eventLocationData: UpdateEventLocationDto,
  ): Promise<EventLocation> {
    const response = await apiClient.put<EventLocation>(
      `/event-locations/${eventLocationData.id}`,
      eventLocationData,
    )
    return response.data
  }

  /**
   * Eliminar relación evento-ubicación
   */
  static async deleteEventLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/event-locations/${id}`)
    return response.data
  }

  /**
   * Activar relación evento-ubicación
   */
  static async activateEventLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(
      `/event-locations/${id}/activate`,
    )
    return response.data
  }

  /**
   * Desactivar relación evento-ubicación
   */
  static async deactivateEventLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(
      `/event-locations/${id}/deactivate`,
    )
    return response.data
  }
}
