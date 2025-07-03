import { apiClient } from './api'
import type {
  Event,
  CreateEventDto,
  UpdateEventDto,
  EventPaginationParams,
  EventPaginatedResponse,
} from '@/types/api'

export class EventService {
  private static readonly BASE_PATH = '/events'

  /**
   * Obtener todos los eventos (incluidos inactivos)
   */
  static async getAllEvents(): Promise<Event[]> {
    const response = await apiClient.get<Event[]>(this.BASE_PATH)
    console.log('🔍 [EventService] Eventos recibidos del backend:', response.data.slice(0, 1)) // Log solo el primero para ver estructura
    return response.data
  }

  /**
   * Obtener solo eventos activos
   */
  static async getActiveEvents(): Promise<Event[]> {
    const response = await apiClient.get<Event[]>(`${this.BASE_PATH}/active`)
    return response.data
  }
  /**
   * Obtener eventos con paginación
   * CORREGIDO: Usar POST con body en lugar de GET con query params
   */
  static async getEventsPaginated(
    params: EventPaginationParams,
  ): Promise<EventPaginatedResponse<Event>> {
    try {
      // Usar GET con query params
      const page = params.page || 1;
      const items = params.items || 10;
      const url = `${this.BASE_PATH}/paginated?page=${page}&items=${items}`;
      console.log('🔍 [EventService] Solicitando eventos paginados con GET:', url);
      const response = await apiClient.get<EventPaginatedResponse<Event>>(url);
      console.log('📥 [EventService] Respuesta recibida:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [EventService] Error en paginación:', error.response?.status, error.message);
      // Si la paginación falla con 400 o 404, usar fallback
      if (error.response?.status === 400 || error.response?.status === 404) {
        console.log('🔄 [EventService] Endpoint GET /api/events/paginated no disponible, usando fallback');
        const allEvents = await this.getAllEvents();
        const startIndex = ((params.page || 1) - 1) * (params.items || 10);
        const endIndex = startIndex + (params.items || 10);
        const paginatedEvents = allEvents.slice(startIndex, endIndex);
        const currentPage = params.page || 1;
        const totalPages = Math.ceil(allEvents.length / (params.items || 10));
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
        };
      }
      throw error;
    }
  }

  /**
   * Obtener evento por ID
   */
  static async getEventById(id: number): Promise<Event> {
    const response = await apiClient.get<Event>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  /**
   * Obtener evento por nombre
   */
  static async getEventByName(name: string): Promise<Event> {
    const response = await apiClient.get<Event>(`${this.BASE_PATH}/name/${encodeURIComponent(name)}`)
    return response.data
  }

  /**
   * Obtener eventos ordenados por fecha de inicio
   * CORREGIDO: Sin parámetros adicionales según especificación
   */
  static async getEventsByStartDate(): Promise<Event[]> {
    const response = await apiClient.get<Event[]>(`${this.BASE_PATH}/start-date`)
    return response.data
  }

  /**
   * Obtener eventos ordenados por fecha de inicio de venta
   * CORREGIDO: Sin parámetros adicionales según especificación
   */
  static async getEventsBySaleStart(): Promise<Event[]> {
    const response = await apiClient.get<Event[]>(`${this.BASE_PATH}/sale-start`)
    return response.data
  }

  /**
   * Crear nuevo evento
   */
  static async createEvent(eventData: CreateEventDto): Promise<Event> {
    console.log('🔍 [EventService] Enviando datos para crear evento:', eventData)
    const response = await apiClient.post<Event>(this.BASE_PATH, eventData)
    console.log('📥 [EventService] Respuesta del backend:', response.data)
    return response.data
  }

  /**
   * Actualizar evento existente
   */
  static async updateEvent(eventData: UpdateEventDto): Promise<Event> {
    const response = await apiClient.put<Event>(`${this.BASE_PATH}/${eventData.id}`, eventData)
    return response.data
  }

  /**
   * Eliminar evento
   */
  static async deleteEvent(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  /**
   * Activar evento
   */
  static async activateEvent(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}/activate`)
    return response.data
  }

  /**
   * Desactivar evento
   */
  static async deactivateEvent(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}/deactivate`)
    return response.data
  }
}
