// Servicio para orquestación de flujos - SOA-BUS
import { apiClient } from './api'
import type { Sale } from './saleService'
import type { Ticket } from './ticketService'

export interface CreateSaleFlowDto {
  userId: number
  eventLocationId: number
  quantity: number
  partnerToken?: string
  cardHash: string
}

export interface SaleFlowResponse {
  sale: Sale
  tickets: Ticket[]
  message: string
  transactionId: string
}

export interface FlowStatus {
  flowId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  steps: {
    stepName: string
    status: 'pending' | 'completed' | 'failed'
    timestamp?: string
    error?: string
  }[]
  result?: any
}

export class FlowService {
  private static readonly BASE_PATH = '/flows'

  /**
   * Orquestación completa de venta
   * Este endpoint coordina la creación de venta, validación de partner,
   * procesamiento de pago y generación de tickets
   */
  static async createSale(saleData: CreateSaleFlowDto): Promise<SaleFlowResponse> {
    try {
      console.log('🔄 Iniciando orquestación de venta:', {
        ...saleData,
        cardHash: '[OCULTO]',
        partnerToken: saleData.partnerToken ? '[PRESENTE]' : '[NO PRESENTE]'
      })

      const response = await apiClient.post<SaleFlowResponse>(`${this.BASE_PATH}/create-sale`, saleData)
      
      console.log('✅ Orquestación de venta completada:', {
        transactionId: response.data.transactionId,
        saleId: response.data.sale?.id,
        ticketsCount: response.data.tickets?.length || 0
      })

      return response.data
    } catch (error: any) {
      console.error('❌ Error en orquestación de venta:', error)
      
      if (error.response?.status === 400) {
        throw new Error('Datos de venta inválidos')
      } else if (error.response?.status === 402) {
        throw new Error('Error en el procesamiento del pago')
      } else if (error.response?.status === 409) {
        throw new Error('No hay suficientes tickets disponibles')
      } else if (error.response?.status === 401) {
        throw new Error('Token de partner inválido')
      } else {
        throw new Error('Error en el proceso de venta. Intenta de nuevo.')
      }
    }
  }

  /**
   * Obtener estado de un flujo en ejecución
   */
  static async getFlowStatus(flowId: string): Promise<FlowStatus> {
    const response = await apiClient.get<FlowStatus>(`${this.BASE_PATH}/status/${flowId}`)
    return response.data
  }

  /**
   * Cancelar un flujo en ejecución
   */
  static async cancelFlow(flowId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`${this.BASE_PATH}/cancel/${flowId}`)
    return response.data
  }

  /**
   * Reintentar un flujo fallido
   */
  static async retryFlow(flowId: string): Promise<SaleFlowResponse> {
    const response = await apiClient.post<SaleFlowResponse>(`${this.BASE_PATH}/retry/${flowId}`)
    return response.data
  }

  /**
   * Obtener historial de flujos
   */
  static async getFlowHistory(userId?: number): Promise<FlowStatus[]> {
    const params = userId ? { userId } : {}
    const response = await apiClient.get<FlowStatus[]>(`${this.BASE_PATH}/history`, { params })
    return response.data
  }
}
