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
      // Realizar todas las peticiones en paralelo para mejor rendimiento
      const [
        allEvents,
        activeEvents,
        allLocations,
        activeLocations,
        allEventLocations,
        allUsers,
        allRoles,
      ] = await Promise.all([
        EventService.getAllEvents().catch(() => []),
        EventService.getActiveEvents().catch(() => []),
        LocationService.getAllLocations().catch(() => []),
        LocationService.getActiveLocations().catch(() => []),
        EventLocationService.getAllEventLocations().catch(() => []),
        UserService.getUsers({ page: 1, limit: 1000 })
          .then((response) => response.response?.users || [])
          .catch(() => []),
        RoleService.getRoles({ page: 1, limit: 1000 })
          .then((response) => response.roles || [])
          .catch(() => []),
      ]) // Calcular métricas de eventos
      const now = new Date()
      const upcomingEvents = allEvents.filter((event: Event) => {
        const startDate = new Date(event.startDate)
        return startDate > now && event.isActive
      })

      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const eventsThisMonth = allEvents.filter((event: Event) => {
        const eventDate = new Date(event.createdAt)
        return eventDate >= thisMonth
      })

      // Calcular métricas de ubicaciones
      const totalCapacity = allLocations.reduce(
        (sum: number, location: Location) => sum + location.capacity,
        0,
      )
      const averageCapacity =
        allLocations.length > 0 ? Math.round(totalCapacity / allLocations.length) : 0 // Calcular métricas de relaciones evento-ubicación
      const activeEventLocations = allEventLocations.filter(
        (rel: EventLocationBasic) => rel.isActive,
      )
      const totalPrices = activeEventLocations.reduce(
        (sum: number, rel: EventLocationBasic) => sum + parseFloat(rel.price),
        0,
      )
      const averagePrice =
        activeEventLocations.length > 0 ? Math.round(totalPrices / activeEventLocations.length) : 0

      // Calcular métricas de usuarios
      const activeUsers = allUsers.filter((user: User) => user.isActive)

      // Datos para gráficos
      const eventsByMonth = this.calculateEventsByMonth(allEvents)
      const locationsByCapacity = this.getTopLocationsByCapacity(allLocations, 5)
      const eventLocationsByPrice = this.getTopEventLocationsByPrice(activeEventLocations, 5)

      return {
        // Eventos
        totalEvents: allEvents.length,
        activeEvents: activeEvents.length,
        upcomingEvents: upcomingEvents.length,
        eventsThisMonth: eventsThisMonth.length,

        // Ubicaciones
        totalLocations: allLocations.length,
        activeLocations: activeLocations.length,
        totalCapacity,
        averageCapacity,

        // Relaciones
        totalEventLocations: allEventLocations.length,
        activeEventLocations: activeEventLocations.length,
        averagePrice,

        // Usuarios
        totalUsers: allUsers.length,
        activeUsers: activeUsers.length,
        totalRoles: allRoles.length,

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
      const metrics = await this.getDashboardMetrics()

      return [
        {
          label: 'Total Eventos',
          value: metrics.totalEvents,
          icon: 'Calendar',
          color: '#409EFF',
          trend: {
            value: metrics.eventsThisMonth,
            type: metrics.eventsThisMonth > 0 ? 'up' : 'neutral',
          },
        },
        {
          label: 'Eventos Activos',
          value: metrics.activeEvents,
          icon: 'Check',
          color: '#67C23A',
        },
        {
          label: 'Próximos Eventos',
          value: metrics.upcomingEvents,
          icon: 'Clock',
          color: '#E6A23C',
        },
        {
          label: 'Total Ubicaciones',
          value: metrics.totalLocations,
          icon: 'Location',
          color: '#F56C6C',
        },
        {
          label: 'Capacidad Total',
          value: metrics.totalCapacity.toLocaleString(),
          icon: 'User',
          color: '#909399',
        },
        {
          label: 'Relaciones Activas',
          value: metrics.activeEventLocations,
          icon: 'Link',
          color: '#873BF4',
        },
        {
          label: 'Precio Promedio',
          value: `$${metrics.averagePrice}`,
          icon: 'Money',
          color: '#F7BA2A',
        },
        {
          label: 'Usuarios Activos',
          value: metrics.activeUsers,
          icon: 'UserFilled',
          color: '#409EFF',
        },
      ]
    } catch (error) {
      console.error('Error al obtener estadísticas rápidas:', error)
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
    overall: boolean
  }> {
    try {
      const [eventsHealth, locationsHealth, usersHealth] = await Promise.allSettled([
        EventService.getAllEvents(),
        LocationService.getAllLocations(),
        UserService.getUsers({ page: 1, limit: 1 }),
      ])

      const events = eventsHealth.status === 'fulfilled'
      const locations = locationsHealth.status === 'fulfilled'
      const users = usersHealth.status === 'fulfilled'

      return {
        events,
        locations,
        users,
        overall: events && locations && users,
      }
    } catch (error) {
      console.error('Error al verificar salud de APIs:', error)
      return {
        events: false,
        locations: false,
        users: false,
        overall: false,
      }
    }
  }
}
