// Configuración base para Axios
import axios, { type AxiosInstance } from 'axios'

// URLs de las APIs - En desarrollo usar proxy, en producción URLs completas
const API_USERS_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_USERS_URL || 'http://localhost:2221/api'
  : '/api'

const API_EVENTS_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_EVENTS_URL || 'http://localhost:2222/api'
  : '/api'

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

  // Interceptor para requests (agregar auth token si existe)
  client.interceptors.request.use(
    (config) => {
      // Aquí puedes agregar el token de autenticación cuando lo implementes
      // const token = localStorage.getItem('auth_token')
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`
      // }
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
        // Redirigir a login o limpiar auth
        console.error('Usuario no autorizado')
      } else if (error.response?.status === 500) {
        console.error('Error del servidor')
      }
      return Promise.reject(error)
    },
  )

  return client
}

// Instancia de Axios para la API de Usuarios
export const apiClientUsers = createApiClient(API_USERS_URL)

// Instancia de Axios para la API de Eventos
export const apiClientEvents = createApiClient(API_EVENTS_URL)
