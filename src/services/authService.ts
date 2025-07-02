// Servicio de autenticación para SOA-BUS
import { apiClient } from './api'

export interface LoginCredentials {
    email: string
    password: string
}

export interface LoginResponse {
    token: string
    user: any // TODO: Definir tipo específico del usuario
}

export interface AuthUser {
    id: number
    email: string
    name: string
    lastname: string
    isActive: boolean
    role: {
        id: number
        name: string
    }
}

export class AuthService {
    private static readonly TOKEN_KEY = 'soa_auth_token'
    private static readonly USER_KEY = 'soa_auth_user'

    /**
     * Realizar login y obtener JWT token
     */
    static async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            console.log('🔐 Intentando login con SOA-BUS:', { email: credentials.email })

            const response = await apiClient.post<LoginResponse>('/auth/login', credentials)

            if (response.data.token) {
                // Guardar token y usuario en localStorage
                this.setToken(response.data.token)
                this.setUser(response.data.user)

                console.log('✅ Login exitoso, token guardado')
                return response.data
            } else {
                throw new Error('No se recibió token en la respuesta')
            }
        } catch (error: any) {
            console.error('❌ Error en login:', error)

            // Limpiar datos de autenticación en caso de error
            this.clearAuth()

            if (error.response?.status === 401) {
                throw new Error('Credenciales inválidas')
            } else if (error.response?.status === 400) {
                throw new Error('Email y contraseña son requeridos')
            } else {
                throw new Error('Error de conexión. Intenta de nuevo.')
            }
        }
    }

    /**
     * Verificar validez del token actual
     */
    static async validateToken(): Promise<AuthUser | null> {
        const token = this.getToken()

        if (!token) {
            return null
        }

        try {
            console.log('🔍 Validando token con SOA-BUS')

            const response = await apiClient.get<AuthUser>('/test')

            if (response.data) {
                // Actualizar datos del usuario si el token es válido
                this.setUser(response.data)
                console.log('✅ Token válido')
                return response.data
            }

            return null
        } catch (error: any) {
            console.error('❌ Token inválido:', error)

            if (error.response?.status === 401) {
                // Token expirado o inválido
                this.clearAuth()
            }

            return null
        }
    }

    /**
     * Cerrar sesión
     */
    static logout(): void {
        console.log('🚪 Cerrando sesión')
        this.clearAuth()
    }

    /**
     * Obtener token actual
     */
    static getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY)
    }

    /**
     * Obtener usuario actual
     */
    static getUser(): AuthUser | null {
        const userStr = localStorage.getItem(this.USER_KEY)
        if (userStr) {
            try {
                return JSON.parse(userStr)
            } catch {
                return null
            }
        }
        return null
    }

    /**
     * Verificar si está autenticado
     */
    static isAuthenticated(): boolean {
        const token = this.getToken()
        const isAuth = !!token
        console.log('🔍 Verificando autenticación:', {
            hasToken: !!token,
            tokenLength: token?.length || 0,
            isAuthenticated: isAuth
        })
        return isAuth
    }

    /**
     * Guardar token
     */
    private static setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token)
    }

    /**
     * Guardar usuario
     */
    private static setUser(user: AuthUser): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }

    /**
     * Limpiar datos de autenticación
     */
    private static clearAuth(): void {
        localStorage.removeItem(this.TOKEN_KEY)
        localStorage.removeItem(this.USER_KEY)
    }

    /**
     * Obtener header de autorización
     */
    static getAuthHeader(): string | null {
        const token = this.getToken()
        return token ? `Bearer ${token}` : null
    }
}
