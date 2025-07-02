// Servicio para gestión de tickets - SOA-BUS
import { apiClient } from './api'

export interface Ticket {
  id: number
  eventLocationId: number
  userId: number
  quantity: number
  totalPrice: number
  status: 'active' | 'used' | 'cancelled'
  purchaseDate: string
  qrCode?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTicketDto {
  eventLocationId: number
  userId: number
  quantity: number
}

export interface UpdateTicketDto {
  id: number
  status?: 'active' | 'used' | 'cancelled'
  quantity?: number
}

export class TicketService {
  private static readonly BASE_PATH = '/tickets'

  /**
   * Obtener todos los tickets
   */
  static async getAllTickets(): Promise<Ticket[]> {
    const response = await apiClient.get<Ticket[]>(this.BASE_PATH)
    return response.data
  }

  /**
   * Obtener ticket por ID
   */
  static async getTicketById(id: number): Promise<Ticket> {
    const response = await apiClient.get<Ticket>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  /**
   * Obtener tickets por usuario
   */
  static async getTicketsByUser(userId: number): Promise<Ticket[]> {
    const response = await apiClient.get<Ticket[]>(`${this.BASE_PATH}/user/${userId}`)
    return response.data
  }

  /**
   * Obtener tickets por evento-ubicación
   */
  static async getTicketsByEventLocation(eventLocationId: number): Promise<Ticket[]> {
    const response = await apiClient.get<Ticket[]>(`${this.BASE_PATH}/event-location/${eventLocationId}`)
    return response.data
  }

  /**
   * Crear nuevo ticket
   */
  static async createTicket(ticketData: CreateTicketDto): Promise<Ticket> {
    const response = await apiClient.post<Ticket>(this.BASE_PATH, ticketData)
    return response.data
  }

  /**
   * Actualizar ticket
   */
  static async updateTicket(ticketData: UpdateTicketDto): Promise<Ticket> {
    const response = await apiClient.put<Ticket>(`${this.BASE_PATH}/${ticketData.id}`, ticketData)
    return response.data
  }

  /**
   * Marcar ticket como usado
   */
  static async useTicket(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}/use`)
    return response.data
  }

  /**
   * Cancelar ticket
   */
  static async cancelTicket(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}/cancel`)
    return response.data
  }

  /**
   * Eliminar ticket
   */
  static async deleteTicket(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${id}`)
    return response.data
  }
}
