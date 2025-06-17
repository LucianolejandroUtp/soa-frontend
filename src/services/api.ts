// Configuración base para Axios
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:2221/api'

// Instancia de Axios configurada
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Interceptor para requests (agregar auth token si existe)
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
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

export default apiClient
