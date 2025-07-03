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
  private static readonly BASE_PATH = '/events/event-locations'

  /**
   * Obtener todas las relaciones evento-ubicación
   */
  static async getAllEventLocations(): Promise<EventLocationBasic[]> {
    const response = await apiClient.get<EventLocationBasic[]>(this.BASE_PATH)
    return response.data
  }

  /**
   * Obtener relaciones evento-ubicación activas
   */
  static async getActiveEventLocations(): Promise<EventLocation[]> {
    const response = await apiClient.get<EventLocation[]>(`${this.BASE_PATH}/active`)
    return response.data
  }

  /**
   * Obtener relaciones evento-ubicación con paginación
   * CORREGIDO: Usar POST con body según especificación
   */
  static async getEventLocationsPaginated(
    params: EventPaginationParams,
  ): Promise<EventPaginatedResponse<EventLocation>> {
    try {
      // Construir body para POST según especificación
      const requestBody = {
        page: params.page || 1,
        limit: params.items || 10,
      }

      console.log('🔍 [EventLocationService] Solicitando relaciones paginadas con POST:', requestBody)

      const response = await apiClient.post<EventPaginatedResponse<EventLocation>>(
        `${this.BASE_PATH}/paginated`,
        requestBody
      )

      console.log('📥 [EventLocationService] Respuesta recibida:', response.data)

      return response.data
    } catch (error: any) {
      console.error('❌ [EventLocationService] Error en paginación:', error.response?.status, error.message)
      throw error
    }
  }

  /**
   * Obtener relación evento-ubicación por ID
   */
  static async getEventLocationById(id: number): Promise<EventLocation> {
    const response = await apiClient.get<EventLocation>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  /**
   * Obtener relaciones por evento
   */
  static async getEventLocationsByEvent(eventId: number): Promise<EventLocation[]> {
    const response = await apiClient.get<EventLocation[]>(`${this.BASE_PATH}/event/${eventId}`)
    return response.data
  }

  /**
   * Obtener relaciones activas por evento
   * NUEVO: Según especificación
   */
  static async getActiveEventLocationsByEvent(eventId: number): Promise<EventLocation[]> {
    const response = await apiClient.get<EventLocation[]>(`${this.BASE_PATH}/event/${eventId}/active`)
    return response.data
  }

  /**
   * Obtener relaciones por ubicación
   */
  static async getEventLocationsByLocation(locationId: number): Promise<EventLocation[]> {
    const response = await apiClient.get<EventLocation[]>(
      `${this.BASE_PATH}/location/${locationId}`,
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
      this.BASE_PATH,
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
      `${this.BASE_PATH}/${eventLocationData.id}`,
      eventLocationData,
    )
    return response.data
  }

  /**
   * Eliminar relación evento-ubicación
   */
  static async deleteEventLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  /**
   * Activar relación evento-ubicación
   */
  static async activateEventLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(
      `${this.BASE_PATH}/${id}/activate`,
    )
    return response.data
  }

  /**
   * Desactivar relación evento-ubicación
   */
  static async deactivateEventLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(
      `${this.BASE_PATH}/${id}/deactivate`,
    )
    return response.data
  }

  /**
   * Verificar disponibilidad de ubicación de evento
   * NUEVO: Según especificación
   */
  static async checkEventLocationAvailability(id: number): Promise<{ available: boolean; message?: string }> {
    const response = await apiClient.get<{ available: boolean; message?: string }>(
      `${this.BASE_PATH}/${id}/available`,
    )
    return response.data
  }
}
