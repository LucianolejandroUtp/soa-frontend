// Configuración base para Axios
import axios, { type AxiosInstance } from 'axios'

// URL base única para el SOA-BUS (API Gateway)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:2222/api'

/**
 * Crea y configura una instancia de Axios.
 * @param baseURL La URL base para la instancia del cliente.
 * @returns Una instancia de Axios configurada.
 */
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  })

  // Interceptor para requests (agregar auth token automáticamente)
  client.interceptors.request.use(
    (config) => {
      // Importar AuthService dinámicamente para evitar dependencias circulares
      const token = localStorage.getItem('soa_auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // Interceptor para responses (manejo global de errores)
  client.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response?.status === 401) {
        // Token expirado o inválido - limpiar autenticación
        console.error('🔒 Usuario no autorizado - limpiando sesión')
        localStorage.removeItem('soa_auth_token')
        localStorage.removeItem('soa_auth_user')
        
        // Redirigir a login si no estamos ya ahí
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      } else if (error.response?.status === 403) {
        console.error('🚫 Acceso denegado - permisos insuficientes')
      } else if (error.response?.status === 500) {
        console.error('🔥 Error del servidor')
      }
      return Promise.reject(error)
    },
  )

  return client
}


// Instancia de Axios única para el SOA-BUS
export const apiClient = createApiClient(API_BASE_URL)
