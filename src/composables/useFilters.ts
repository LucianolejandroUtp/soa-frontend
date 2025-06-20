import { ref, computed, watch } from 'vue'

export interface FilterState {
  search: string
  [key: string]: unknown
}

export interface UseFiltersOptions {
  // Clave para localStorage
  storageKey: string
  // Delay para debounce en ms
  debounceMs?: number
  // Filtros iniciales
  initialFilters?: Partial<FilterState>
  // Callback cuando los filtros cambian
  onFiltersChange?: (filters: FilterState) => void
}

export function useFilters<T extends FilterState>(options: UseFiltersOptions) {
  const { storageKey, debounceMs = 300, initialFilters = {}, onFiltersChange } = options

  // Estado de los filtros
  const filters = ref<T>({
    search: '',
    ...initialFilters,
  } as T)

  // Estado de loading para debounce
  const isFiltering = ref(false)
  // Timer para debounce
  let debounceTimer: number | null = null

  /**
   * Cargar filtros desde localStorage
   */
  const loadFiltersFromStorage = (): void => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsedFilters = JSON.parse(stored)
        Object.assign(filters.value, parsedFilters)
      }
    } catch (error) {
      console.warn('Error al cargar filtros desde localStorage:', error)
    }
  }

  /**
   * Guardar filtros en localStorage
   */
  const saveFiltersToStorage = (): void => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(filters.value))
    } catch (error) {
      console.warn('Error al guardar filtros en localStorage:', error)
    }
  }

  /**
   * Limpiar todos los filtros
   */
  const clearFilters = (): void => {
    Object.keys(filters.value).forEach((key) => {
      if (key === 'search') {
        filters.value[key] = ''
      } else if (typeof filters.value[key] === 'boolean') {
        filters.value[key] = null
      } else if (typeof filters.value[key] === 'number') {
        filters.value[key] = null
      } else {
        filters.value[key] = null
      }
    })

    saveFiltersToStorage()
  }

  /**
   * Verificar si hay filtros activos
   */
  const hasActiveFilters = computed((): boolean => {
    return Object.entries(filters.value).some(([key, value]) => {
      if (key === 'search') {
        return value && value.toString().trim() !== ''
      }
      return value !== null && value !== undefined && value !== ''
    })
  })
  /**
   * Obtener filtros activos (no null/undefined/empty)
   */
  const activeFilters = computed(() => {
    const active: Record<string, unknown> = {}

    Object.entries(filters.value).forEach(([key, value]) => {
      if (key === 'search' && value && value.toString().trim() !== '') {
        active[key] = value
      } else if (value !== null && value !== undefined && value !== '') {
        active[key] = value
      }
    })

    return active as Partial<T>
  })

  /**
   * Aplicar filtros con debounce
   */
  const applyFiltersWithDebounce = (): void => {
    isFiltering.value = true

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      isFiltering.value = false
      saveFiltersToStorage()

      if (onFiltersChange) {
        onFiltersChange(filters.value)
      }
    }, debounceMs)
  }

  /**
   * Actualizar un filtro específico
   */
  const updateFilter = <K extends keyof T>(key: K, value: T[K]): void => {
    filters.value[key] = value
    applyFiltersWithDebounce()
  }

  /**
   * Actualizar múltiples filtros a la vez
   */
  const updateFilters = (newFilters: Partial<T>): void => {
    Object.assign(filters.value, newFilters)
    applyFiltersWithDebounce()
  }

  /**
   * Construir query string para APIs
   */
  const buildQueryString = (): string => {
    const params = new URLSearchParams()

    Object.entries(activeFilters.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value.toString())
      }
    })

    return params.toString()
  }
  /**
   * Función para filtrar arrays localmente
   */
  const filterArrayLocally = <Item extends Record<string, unknown>>(
    items: Item[],
    filterConfig: {
      searchFields?: (keyof Item)[]
      customFilters?: {
        [K in keyof T]?: (item: Item, filterValue: T[K]) => boolean
      }
    } = {},
  ): Item[] => {
    let filteredItems = [...items]

    // Aplicar búsqueda de texto
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase().trim()
      const searchFields = filterConfig.searchFields || ['name']

      filteredItems = filteredItems.filter((item) =>
        searchFields.some((field) => {
          const fieldValue = item[field]
          return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm)
        }),
      )
    }

    // Aplicar filtros personalizados
    if (filterConfig.customFilters) {
      Object.entries(filterConfig.customFilters).forEach(([key, filterFn]) => {
        const filterValue = filters.value[key as keyof T]
        if (filterValue !== null && filterValue !== undefined && filterFn) {
          filteredItems = filteredItems.filter((item) => filterFn(item, filterValue))
        }
      })
    }

    return filteredItems
  }

  /**
   * Watcher para guardar cambios automáticamente
   */
  watch(
    filters,
    () => {
      saveFiltersToStorage()
    },
    { deep: true },
  )

  // Cargar filtros al inicializar
  loadFiltersFromStorage()

  return {
    // Estado
    filters,
    isFiltering,
    hasActiveFilters,
    activeFilters,

    // Métodos
    updateFilter,
    updateFilters,
    clearFilters,
    buildQueryString,
    filterArrayLocally,

    // Utilidades
    loadFiltersFromStorage,
    saveFiltersToStorage,
  }
}

// Tipos específicos para cada vista

export interface EventFilters extends FilterState {
  search: string
  status: boolean | null
  startDate: string | null
  endDate: string | null
}

export interface LocationFilters extends FilterState {
  search: string
  status: boolean | null
  minCapacity: number | null
  maxCapacity: number | null
}

export interface EventLocationFilters extends FilterState {
  search: string
  eventId: number | null
  locationId: number | null
  minPrice: number | null
  maxPrice: number | null
  status: boolean | null
}

export interface UserFilters extends FilterState {
  search: string
  roleId: number | null
  status: boolean | null
}

// Composables específicos para cada vista

export function useEventFilters() {
  return useFilters<EventFilters>({
    storageKey: 'events-filters',
    initialFilters: {
      search: '',
      status: null,
      startDate: null,
      endDate: null,
    },
  })
}

export function useLocationFilters() {
  return useFilters<LocationFilters>({
    storageKey: 'locations-filters',
    initialFilters: {
      search: '',
      status: null,
      minCapacity: null,
      maxCapacity: null,
    },
  })
}

export function useEventLocationFilters() {
  return useFilters<EventLocationFilters>({
    storageKey: 'event-locations-filters',
    initialFilters: {
      search: '',
      eventId: null,
      locationId: null,
      minPrice: null,
      maxPrice: null,
      status: null,
    },
  })
}

export function useUserFilters() {
  return useFilters<UserFilters>({
    storageKey: 'users-filters',
    initialFilters: {
      search: '',
      roleId: null,
      status: null,
    },
  })
}
