import { apiClientEvents } from './api'
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
    const response = await apiClientEvents.get<Event[]>('/events')
    return response.data
  }

  /**
   * Obtener solo eventos activos
   */
  static async getActiveEvents(): Promise<Event[]> {
    const response = await apiClientEvents.get<Event[]>('/events/active')
    return response.data
  }

  /**
   * Obtener eventos con paginación
   */
  static async getEventsPaginated(
    params: EventPaginationParams,
  ): Promise<EventPaginatedResponse<Event>> {
    const queryParams = new URLSearchParams()

    // La API de eventos usa page basado en 0, pero mostramos basado en 1 en la UI
    if (params.page !== undefined) {
      queryParams.append('page', (params.page - 1).toString())
    }

    if (params.items !== undefined) {
      queryParams.append('items', params.items.toString())
    }

    const response = await apiClientEvents.get<EventPaginatedResponse<Event>>(
      `/events/paginated?${queryParams.toString()}`,
    )

    // Ajustar el currentPage para que sea basado en 1 para la UI
    if (response.data.pagination) {
      response.data.pagination.currentPage = response.data.pagination.currentPage + 1
    }

    return response.data
  }

  /**
   * Obtener evento por ID
   */
  static async getEventById(id: number): Promise<Event> {
    const response = await apiClientEvents.get<Event>(`/events/${id}`)
    return response.data
  }

  /**
   * Obtener evento por nombre
   */
  static async getEventByName(name: string): Promise<Event> {
    const response = await apiClientEvents.get<Event>(`/events/name/${encodeURIComponent(name)}`)
    return response.data
  }

  /**
   * Obtener eventos por fecha de inicio
   */
  static async getEventsByStartDate(date: string): Promise<Event[]> {
    const response = await apiClientEvents.get<Event[]>(
      `/events/start-date?date=${encodeURIComponent(date)}`,
    )
    return response.data
  }

  /**
   * Obtener eventos por fecha de inicio de venta
   */
  static async getEventsBySaleStart(date: string): Promise<Event[]> {
    const response = await apiClientEvents.get<Event[]>(
      `/events/sale-start?date=${encodeURIComponent(date)}`,
    )
    return response.data
  }

  /**
   * Crear nuevo evento
   */
  static async createEvent(eventData: CreateEventDto): Promise<Event> {
    const response = await apiClientEvents.post<Event>('/events', eventData)
    return response.data
  }

  /**
   * Actualizar evento existente
   */
  static async updateEvent(eventData: UpdateEventDto): Promise<Event> {
    const response = await apiClientEvents.put<Event>(`/events/${eventData.event_id}`, eventData)
    return response.data
  }

  /**
   * Eliminar evento
   */
  static async deleteEvent(id: number): Promise<{ message: string }> {
    const response = await apiClientEvents.delete<{ message: string }>(`/events/${id}`)
    return response.data
  }

  /**
   * Activar evento
   */
  static async activateEvent(id: number): Promise<{ message: string }> {
    const response = await apiClientEvents.patch<{ message: string }>(`/events/${id}/activate`)
    return response.data
  }

  /**
   * Desactivar evento
   */
  static async deactivateEvent(id: number): Promise<{ message: string }> {
    const response = await apiClientEvents.patch<{ message: string }>(`/events/${id}/deactivate`)
    return response.data
  }
}
