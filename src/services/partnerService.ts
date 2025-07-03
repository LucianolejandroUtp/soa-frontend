// Servicio para gestión de partners - SOA-BUS
import { apiClient } from './api'

export interface Partner {
  id: number
  name: string
  email: string
  apiToken: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePartnerDto {
  name: string
  email: string
}

export interface UpdatePartnerDto {
  id: number
  name?: string
  email?: string
  isActive?: boolean
}

export interface PartnerTokenRequest {
  partnerId: number
  credentials?: any
}

export interface PartnerTokenResponse {
  token: string
  expiresIn: number
}

export class PartnerService {
  private static readonly BASE_PATH = '/api/partners'

  /**
   * Obtener todos los partners
   */
  static async getAllPartners(): Promise<Partner[]> {
    const response = await apiClient.get<Partner[]>(this.BASE_PATH)
    return response.data
  }

  /**
   * Obtener partner por ID
   */
  static async getPartnerById(id: number): Promise<Partner> {
    const response = await apiClient.get<Partner>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  /**
   * Crear nuevo partner
   */
  static async createPartner(partnerData: CreatePartnerDto): Promise<Partner> {
    const response = await apiClient.post<Partner>(this.BASE_PATH, partnerData)
    return response.data
  }

  /**
   * Actualizar partner
   */
  static async updatePartner(partnerData: UpdatePartnerDto): Promise<Partner> {
    const response = await apiClient.put<Partner>(`${this.BASE_PATH}/${partnerData.id}`, partnerData)
    return response.data
  }

  /**
   * Activar partner
   */
  static async activatePartner(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}/activate`)
    return response.data
  }

  /**
   * Desactivar partner
   */
  static async deactivatePartner(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}/deactivate`)
    return response.data
  }

  /**
   * Eliminar partner
   */
  static async deletePartner(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  /**
   * Obtener token de partner
   */
  static async getPartnerToken(request: PartnerTokenRequest): Promise<PartnerTokenResponse> {
    const response = await apiClient.post<PartnerTokenResponse>(`${this.BASE_PATH}/token`, request)
    return response.data
  }

  /**
   * Regenerar API token de partner
   */
  static async regenerateApiToken(id: number): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>(`${this.BASE_PATH}/${id}/regenerate-token`)
    return response.data
  }
}
