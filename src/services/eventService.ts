import { apiClient } from './api'
import type {
  Event,
  CreateEventDto,
  UpdateEventDto,
  EventPaginationParams,
  EventPaginatedResponse,
} from '@/types/api'

export class EventService {
  /**
   * Obtener todos los eventos (incluidos inactivos)
   */
  static async getAllEvents(): Promise<Event[]> {
    const response = await apiClient.get<Event[]>('/events')
    return response.data
  }

  /**
   * Obtener solo eventos activos
   */
  static async getActiveEvents(): Promise<Event[]> {
    const response = await apiClient.get<Event[]>('/events/active')
    return response.data
  }
  /**
   * Obtener eventos con paginación
   */
  static async getEventsPaginated(
    params: EventPaginationParams,
  ): Promise<EventPaginatedResponse<Event>> {
    try {
      // Construir parámetros excluyendo valores undefined
      const queryParams: Record<string, string | number> = {}

      if (params.page !== undefined) {
        // SOA-BUS usa paginación basada en 1, no en 0
        queryParams.page = params.page
      }

      if (params.items !== undefined) {
        // Verificar diferentes nombres de parámetros que SOA-BUS podría esperar
        queryParams.limit = params.items  // Algunos sistemas usan 'limit'
        queryParams.items = params.items  // Mantener el original también
      }

      console.log('🔍 [EventService] Solicitando eventos paginados:', queryParams)

      const response = await apiClient.get<EventPaginatedResponse<Event>>('/events/paginated', {
        params: queryParams,
      })

      console.log('📥 [EventService] Respuesta recibida:', response.data)

      return response.data
    } catch (error: any) {
      console.error('❌ [EventService] Error en paginación:', error.response?.status, error.message)

      // Si la paginación falla con 400 o 404, usar fallback
      if (error.response?.status === 400 || error.response?.status === 404) {
        console.log('🔄 [EventService] Endpoint /events/paginated no disponible, usando fallback')

        const allEvents = await this.getAllEvents()
        const startIndex = ((params.page || 1) - 1) * (params.items || 10)
        const endIndex = startIndex + (params.items || 10)
        const paginatedEvents = allEvents.slice(startIndex, endIndex)
        const currentPage = params.page || 1
        const totalPages = Math.ceil(allEvents.length / (params.items || 10))

        return {
          response: paginatedEvents,
          pagination: {
            currentPage,
            totalItems: allEvents.length,
            totalPages,
            itemsPerPage: params.items || 10,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
          },
        }
      }

      throw error
    }
  }

  /**
   * Obtener evento por ID
   */
  static async getEventById(id: number): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${id}`)
    return response.data
  }

  /**
   * Obtener evento por nombre
   */
  static async getEventByName(name: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/name/${encodeURIComponent(name)}`)
    return response.data
  }

  /**
   * Obtener eventos por fecha de inicio
   */
  static async getEventsByStartDate(date: string): Promise<Event[]> {
    const response = await apiClient.get<Event[]>(
      `/events/start-date?date=${encodeURIComponent(date)}`,
    )
    return response.data
  }

  /**
   * Obtener eventos por fecha de inicio de venta
   */
  static async getEventsBySaleStart(date: string): Promise<Event[]> {
    const response = await apiClient.get<Event[]>(
      `/events/sale-start?date=${encodeURIComponent(date)}`,
    )
    return response.data
  }

  /**
   * Crear nuevo evento
   */
  static async createEvent(eventData: CreateEventDto): Promise<Event> {
    const response = await apiClient.post<Event>('/events', eventData)
    return response.data
  }

  /**
   * Actualizar evento existente
   */
  static async updateEvent(eventData: UpdateEventDto): Promise<Event> {
    const response = await apiClient.put<Event>(`/events/${eventData.event_id}`, eventData)
    return response.data
  }

  /**
   * Eliminar evento
   */
  static async deleteEvent(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/events/${id}`)
    return response.data
  }

  /**
   * Activar evento
   */
  static async activateEvent(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`/events/${id}/activate`)
    return response.data
  }

  /**
   * Desactivar evento
   */
  static async deactivateEvent(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`/events/${id}/deactivate`)
    return response.data
  }
}
