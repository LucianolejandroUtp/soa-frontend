import { EventService } from './eventService'
import { LocationService } from './locationService'
import { EventLocationService } from './eventLocationService'
import { UserService } from './userService'
import { RoleService } from './roleService'
import type { Event, Location, EventLocationBasic, User } from '@/types/api'

export interface DashboardMetrics {
  // Métricas de eventos
  totalEvents: number
  activeEvents: number
  upcomingEvents: number
  eventsThisMonth: number

  // Métricas de ubicaciones
  totalLocations: number
  activeLocations: number
  totalCapacity: number
  averageCapacity: number

  // Métricas de relaciones
  totalEventLocations: number
  activeEventLocations: number
  averagePrice: number

  // Métricas de usuarios
  totalUsers: number
  activeUsers: number
  totalRoles: number

  // Datos para gráficos
  eventsByMonth: Array<{ month: string; count: number }>
  locationsByCapacity: Array<{ name: string; capacity: number }>
  eventLocationsByPrice: Array<{ name: string; price: number }>
}

export interface QuickStats {
  label: string
  value: number | string
  icon: string
  color: string
  trend?: {
    value: number
    type: 'up' | 'down' | 'neutral'
  }
}

export class DashboardService {
  /**
   * Obtener todas las métricas del dashboard
   */
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      console.log('📊 [Dashboard] Iniciando carga de métricas...')

      // Realizar todas las peticiones en paralelo con manejo individual de errores
      const [
        allEvents,
        activeEvents,
        allLocations,
        activeLocations,
        allEventLocations,
        allUsers,
        allRoles,
      ] = await Promise.allSettled([
        EventService.getAllEvents(),
        EventService.getActiveEvents(),
        LocationService.getAllLocations(),
        LocationService.getActiveLocations(),
        EventLocationService.getAllEventLocations(),
        UserService.getUsers({ page: 1, limit: 1000 })
          .then((response) => response.response?.users || []),
        RoleService.getRoles({ page: 1, limit: 1000 })
          .then((response) => response.roles || []),
      ])

      // Extraer datos exitosos, usar arrays vacíos para servicios fallidos
      const eventsList = allEvents.status === 'fulfilled' ? allEvents.value : []
      const activeEventsList = activeEvents.status === 'fulfilled' ? activeEvents.value : []
      const locationsList = allLocations.status === 'fulfilled' ? allLocations.value : []
      const activeLocationsList = activeLocations.status === 'fulfilled' ? activeLocations.value : []
      const eventLocationsList = allEventLocations.status === 'fulfilled' ? allEventLocations.value : []
      const usersList = allUsers.status === 'fulfilled' ? allUsers.value : []
      const rolesList = allRoles.status === 'fulfilled' ? allRoles.value : []

      console.log('📊 [Dashboard] Datos obtenidos:', {
        eventos: eventsList.length,
        eventosActivos: activeEventsList.length,
        ubicaciones: locationsList.length,
        ubicacionesActivas: activeLocationsList.length,
        relaciones: eventLocationsList.length,
        usuarios: usersList.length,
        roles: rolesList.length
      })      // Calcular métricas de eventos
      const now = new Date()
      const upcomingEvents = eventsList.filter((event: Event) => {
        const startDate = new Date(event.startDate)
        return startDate > now && event.isActive
      })

      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const eventsThisMonth = eventsList.filter((event: Event) => {
        const eventDate = new Date(event.createdAt)
        return eventDate >= thisMonth
      })

      // Calcular métricas de ubicaciones
      const totalCapacity = locationsList.reduce(
        (sum: number, location: Location) => sum + location.capacity,
        0,
      )
      const averageCapacity =
        locationsList.length > 0 ? Math.round(totalCapacity / locationsList.length) : 0

      // Calcular métricas de relaciones evento-ubicación
      const activeEventLocations = eventLocationsList.filter(
        (rel: EventLocationBasic) => rel.isActive,
      )
      const totalPrices = activeEventLocations.reduce(
        (sum: number, rel: EventLocationBasic) => sum + parseFloat(rel.price),
        0,
      )
      const averagePrice =
        activeEventLocations.length > 0 ? Math.round(totalPrices / activeEventLocations.length) : 0

      // Calcular métricas de usuarios
      const activeUsers = usersList.filter((user: User) => user.isActive)

      // Datos para gráficos
      const eventsByMonth = this.calculateEventsByMonth(eventsList)
      const locationsByCapacity = this.getTopLocationsByCapacity(locationsList, 5)
      const eventLocationsByPrice = this.getTopEventLocationsByPrice(activeEventLocations, 5)

      return {
        // Eventos
        totalEvents: eventsList.length,
        activeEvents: activeEventsList.length,
        upcomingEvents: upcomingEvents.length,
        eventsThisMonth: eventsThisMonth.length,

        // Ubicaciones
        totalLocations: locationsList.length,
        activeLocations: activeLocationsList.length,
        totalCapacity,
        averageCapacity,

        // Relaciones
        totalEventLocations: eventLocationsList.length,
        activeEventLocations: activeEventLocations.length,
        averagePrice,

        // Usuarios
        totalUsers: usersList.length,
        activeUsers: activeUsers.length,
        totalRoles: rolesList.length,

        // Gráficos
        eventsByMonth,
        locationsByCapacity,
        eventLocationsByPrice,
      }
    } catch (error) {
      console.error('Error al obtener métricas del dashboard:', error)
      return this.getEmptyMetrics()
    }
  }

  /**
   * Obtener estadísticas rápidas para cards del dashboard
   */
  static async getQuickStats(): Promise<QuickStats[]> {
    try {
      console.log('📈 [Dashboard] Cargando estadísticas rápidas...')
      const metrics = await this.getDashboardMetrics()

      const stats: QuickStats[] = []

      // Solo mostrar estadísticas si hay datos disponibles
      if (metrics.totalEvents > 0 || metrics.activeEvents > 0) {
        stats.push({
          label: 'Total Eventos',
          value: metrics.totalEvents,
          icon: 'Calendar',
          color: '#409EFF',
          trend: {
            value: metrics.eventsThisMonth,
            type: metrics.eventsThisMonth > 0 ? 'up' : 'neutral',
          },
        })

        stats.push({
          label: 'Eventos Activos',
          value: metrics.activeEvents,
          icon: 'Check',
          color: '#67C23A',
        })

        stats.push({
          label: 'Próximos Eventos',
          value: metrics.upcomingEvents,
          icon: 'Clock',
          color: '#E6A23C',
        })
      }

      if (metrics.totalUsers > 0) {
        stats.push({
          label: 'Usuarios Activos',
          value: metrics.activeUsers,
          icon: 'UserFilled',
          color: '#409EFF',
        })
      }

      // Solo mostrar si el servicio de ubicaciones está disponible
      if (metrics.totalLocations > 0) {
        stats.push({
          label: 'Total Ubicaciones',
          value: metrics.totalLocations,
          icon: 'Location',
          color: '#F56C6C',
        })

        stats.push({
          label: 'Capacidad Total',
          value: metrics.totalCapacity.toLocaleString(),
          icon: 'User',
          color: '#909399',
        })
      }

      // Solo mostrar si el servicio de relaciones está disponible
      if (metrics.totalEventLocations > 0) {
        stats.push({
          label: 'Relaciones Activas',
          value: metrics.activeEventLocations,
          icon: 'Link',
          color: '#873BF4',
        })

        stats.push({
          label: 'Precio Promedio',
          value: `$${metrics.averagePrice}`,
          icon: 'Money',
          color: '#F7BA2A',
        })
      }

      console.log('📈 [Dashboard] Estadísticas cargadas:', stats.length)
      return stats
    } catch (error) {
      console.error('❌ [Dashboard] Error al obtener estadísticas rápidas:', error)
      return []
    }
  }

  /**
   * Calcular eventos por mes para gráfico
   */ private static calculateEventsByMonth(
    events: Event[],
  ): Array<{ month: string; count: number }> {
    const monthCounts = new Map<string, number>()

    events.forEach((event) => {
      const date = new Date(event.createdAt)
      const monthName = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })

      monthCounts.set(monthName, (monthCounts.get(monthName) || 0) + 1)
    })

    return Array.from(monthCounts.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Últimos 6 meses
  }

  /**
   * Obtener top ubicaciones por capacidad
   */
  private static getTopLocationsByCapacity(
    locations: Location[],
    limit: number = 5,
  ): Array<{ name: string; capacity: number }> {
    return locations
      .filter((location) => location.isActive)
      .sort((a, b) => b.capacity - a.capacity)
      .slice(0, limit)
      .map((location) => ({
        name: location.name,
        capacity: location.capacity,
      }))
  }
  /**
   * Obtener top relaciones por precio
   */
  private static getTopEventLocationsByPrice(
    eventLocations: EventLocationBasic[],
    limit: number = 5,
  ): Array<{ name: string; price: number }> {
    return eventLocations
      .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      .slice(0, limit)
      .map((rel) => ({
        name: rel.name,
        price: parseFloat(rel.price),
      }))
  }

  /**
   * Métricas vacías como fallback
   */
  private static getEmptyMetrics(): DashboardMetrics {
    return {
      totalEvents: 0,
      activeEvents: 0,
      upcomingEvents: 0,
      eventsThisMonth: 0,
      totalLocations: 0,
      activeLocations: 0,
      totalCapacity: 0,
      averageCapacity: 0,
      totalEventLocations: 0,
      activeEventLocations: 0,
      averagePrice: 0,
      totalUsers: 0,
      activeUsers: 0,
      totalRoles: 0,
      eventsByMonth: [],
      locationsByCapacity: [],
      eventLocationsByPrice: [],
    }
  }

  /**
   * Validar salud de las APIs
   */
  static async checkApiHealth(): Promise<{
    events: boolean
    locations: boolean
    users: boolean
    eventLocations: boolean
    roles: boolean
    overall: boolean
  }> {
    try {
      console.log('🏥 [Dashboard] Verificando salud de APIs...')

      const [eventsHealth, locationsHealth, usersHealth, eventLocationsHealth, rolesHealth] = await Promise.allSettled([
        EventService.getAllEvents(),
        LocationService.getAllLocations(),
        UserService.getUsers({ page: 1, limit: 1 }),
        EventLocationService.getAllEventLocations(),
        RoleService.getRoles({ page: 1, limit: 1 }),
      ])

      const events = eventsHealth.status === 'fulfilled'
      const locations = locationsHealth.status === 'fulfilled'
      const users = usersHealth.status === 'fulfilled'
      const eventLocations = eventLocationsHealth.status === 'fulfilled'
      const roles = rolesHealth.status === 'fulfilled'

      console.log('🏥 [Dashboard] Estado de APIs:', {
        eventos: events ? '✅' : '❌',
        ubicaciones: locations ? '✅' : '❌',
        usuarios: users ? '✅' : '❌',
        relaciones: eventLocations ? '✅' : '❌',
        roles: roles ? '✅' : '❌'
      })

      return {
        events,
        locations,
        users,
        eventLocations,
        roles,
        overall: events || locations || users || eventLocations || roles, // Al menos una API debe funcionar
      }
    } catch (error) {
      console.error('❌ [Dashboard] Error al verificar salud de APIs:', error)
      return {
        events: false,
        locations: false,
        users: false,
        eventLocations: false,
        roles: false,
        overall: false,
      }
    }
  }
}
