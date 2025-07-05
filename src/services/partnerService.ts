import { apiClient } from './api'
import type {
  Partner,
  CreatePartnerDto,
  UpdatePartnerDto,
  LoginPartnerDto,
  UpdatePasswordPartnerDto,
  PartnerPaginationParams,
  PartnerPaginatedResponse,
} from '@/types/api'

export class PartnerService {
  private static readonly BASE_PATH = '/partners'

  /**
   * Obtener todos los partners (fallback para paginación frontend)
   */
  static async getAllPartners(): Promise<Partner[]> {
    const response = await apiClient.get<Partner[]>(this.BASE_PATH)
    console.log('🔍 [PartnerService] Partners recibidos del backend:', response.data.slice(0, 1)) // Log solo el primero para ver estructura
    return response.data
  }

  /**
   * Obtener partners con paginación
   */
  static async getPartnersPaginated(
    params: PartnerPaginationParams,
  ): Promise<PartnerPaginatedResponse<Partner>> {
    const page = params.page || 1;
    const items = params.items || 10;
    const url = `${this.BASE_PATH}?page=${page}&items=${items}`;

    console.log('🔍 [PartnerService] Solicitando partners paginados:', url);
    console.log('� [PartnerService] URL completa será:', `${apiClient.defaults.baseURL}${url}`);

    const response = await apiClient.get<PartnerPaginatedResponse<Partner>>(url);
    console.log('� [PartnerService] Respuesta paginada recibida:', response.data);

    return response.data;
  }

  /**
   * Obtener partner por ID
   */
  static async getPartnerById(id: number): Promise<Partner> {
    const response = await apiClient.get<Partner>(`${this.BASE_PATH}/${id}`)
    console.log('🔍 [PartnerService] Partner obtenido por ID:', response.data);
    return response.data
  }

  /**
   * Obtener partner por token
   */
  static async getPartnerByToken(token: string): Promise<Partner> {
    const response = await apiClient.get<Partner>(`${this.BASE_PATH}/token/${encodeURIComponent(token)}`)
    console.log('🔍 [PartnerService] Partner obtenido por token:', response.data);
    return response.data
  }

  /**
   * Crear nuevo partner
   */
  static async createPartner(partnerData: CreatePartnerDto): Promise<Partner> {
    console.log('🔍 [PartnerService] Enviando datos para crear partner:', partnerData)
    const response = await apiClient.post<Partner>(this.BASE_PATH, partnerData)
    console.log('📥 [PartnerService] Partner creado exitosamente:', response.data)
    return response.data
  }

  /**
   * Actualizar partner existente
   */
  static async updatePartner(partnerData: UpdatePartnerDto): Promise<Partner> {
    console.log('🔍 [PartnerService] Enviando datos para actualizar partner:', partnerData)
    const response = await apiClient.put<Partner>(this.BASE_PATH, partnerData)
    console.log('📥 [PartnerService] Partner actualizado exitosamente:', response.data)
    return response.data
  }

  /**
   * Login de partner
   */
  static async loginPartner(loginData: LoginPartnerDto): Promise<{ token: string; partner: Partner }> {
    console.log('🔍 [PartnerService] Intentando login de partner:', { email: loginData.email })
    const response = await apiClient.post<{ token: string; partner: Partner }>(`${this.BASE_PATH}/login`, loginData)
    console.log('📥 [PartnerService] Login exitoso para partner:', response.data.partner.email)
    return response.data
  }

  /**
   * Actualizar contraseña de partner
   */
  static async updatePartnerPassword(passwordData: UpdatePasswordPartnerDto): Promise<{ message: string }> {
    console.log('🔍 [PartnerService] Actualizando contraseña para partner ID:', passwordData.id)
    const response = await apiClient.post<{ message: string }>(`${this.BASE_PATH}/update-password`, passwordData)
    console.log('📥 [PartnerService] Contraseña actualizada exitosamente')
    return response.data
  }

  /**
   * Activar partner (si el endpoint existe en el backend)
   */
  static async activatePartner(id: number): Promise<{ message: string }> {
    console.log('🔍 [PartnerService] Activando partner ID:', id)
    const response = await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}/activate`)
    console.log('📥 [PartnerService] Partner activado exitosamente')
    return response.data
  }

  /**
   * Desactivar partner (si el endpoint existe en el backend)
   */
  static async deactivatePartner(id: number): Promise<{ message: string }> {
    console.log('🔍 [PartnerService] Desactivando partner ID:', id)
    const response = await apiClient.patch<{ message: string }>(`${this.BASE_PATH}/${id}/deactivate`)
    console.log('📥 [PartnerService] Partner desactivado exitosamente')
    return response.data
  }

  /**
   * Eliminar partner (soft delete, si el endpoint existe en el backend)
   */
  static async deletePartner(id: number): Promise<{ message: string }> {
    console.log('🔍 [PartnerService] Eliminando partner ID:', id)
    const response = await apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${id}`)
    console.log('📥 [PartnerService] Partner eliminado exitosamente')
    return response.data
  }
}
