// Servicio para gestión de ventas - SOA-BUS
import { apiClient } from './api'

export interface Sale {
  id: number
  userId: number
  eventLocationId: number
  quantity: number
  totalAmount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentMethod: string
  cardHash?: string
  saleDate: string
  createdAt: string
  updatedAt: string
}

export interface CreateSaleDto {
  userId: number
  eventLocationId: number
  quantity: number
  paymentMethod: string
  cardHash?: string
}

export interface UpdateSaleDto {
  id: number
  status?: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentMethod?: string
}

export class SaleService {
  private static readonly BASE_PATH = '/sales'

  /**
   * Obtener todas las ventas
   */
  static async getAllSales(): Promise<Sale[]> {
    const response = await apiClient.get<Sale[]>(this.BASE_PATH)
    return response.data
  }

  /**
   * Obtener venta por ID
   */
  static async getSaleById(id: number): Promise<Sale> {
    const response = await apiClient.get<Sale>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  /**
   * Obtener ventas por usuario
   */
  static async getSalesByUser(userId: number): Promise<Sale[]> {
    const response = await apiClient.get<Sale[]>(`${this.BASE_PATH}/user/${userId}`)
    return response.data
  }

  /**
   * Obtener ventas por evento-ubicación
   */
  static async getSalesByEventLocation(eventLocationId: number): Promise<Sale[]> {
    const response = await apiClient.get<Sale[]>(`${this.BASE_PATH}/event-location/${eventLocationId}`)
    return response.data
  }

  /**
   * Crear nueva venta
   */
  static async createSale(saleData: CreateSaleDto): Promise<Sale> {
    const response = await apiClient.post<Sale>(this.BASE_PATH, saleData)
    return response.data
  }

  /**
   * Actualizar venta
   */
  static async updateSale(saleData: UpdateSaleDto): Promise<Sale> {
    const response = await apiClient.put<Sale>(`${this.BASE_PATH}/${saleData.id}`, saleData)
    return response.data
  }

  /**
   * Completar venta
   */
  static async completeSale(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}/complete`)
    return response.data
  }

  /**
   * Cancelar venta
   */
  static async cancelSale(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}/cancel`)
    return response.data
  }

  /**
   * Eliminar venta
   */
  static async deleteSale(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${id}`)
    return response.data
  }
}
