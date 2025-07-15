# Plan de Implementación - Módulo Partners

## Objetivo
Implementar el módulo completo de gestión de Partners en el frontend Vue.js, siguiendo los patrones establecidos en el módulo de Events y basándose en los endpoints definidos en ENDPOINTS.md.

## Análisis de Endpoints Disponibles

### Endpoints Partners (`/api/partners`)
1. **GET `/api/partners`** - Lista paginada de partners
2. **GET `/api/partners/:id`** - Obtener partner por ID
3. **GET `/api/partners/token/:token`** - Obtener partner por token
4. **POST `/api/partners`** - Crear nuevo partner
5. **PUT `/api/partners`** - Actualizar partner
6. **POST `/api/partners/login`** - Login de partner
7. **POST `/api/partners/update-password`** - Actualizar contraseña

## Estructura Propuesta

### Fase 1: Definición de Tipos y DTOs
**Archivos a crear/modificar:**
- `src/types/api.ts` - Agregar interfaces Partner, CreatePartnerDto, UpdatePartnerDto, LoginPartnerDto, UpdatePasswordPartnerDto

**Tipos principales:**
```typescript
interface Partner {
  id: number
  name: string
  lastname: string
  email: string
  token: string
  createdAt: string
  updatedAt: string
  deleted?: boolean
  isActive?: boolean
}

interface CreatePartnerDto {
  name: string
  lastname: string
  email: string
  password: string
}

interface UpdatePartnerDto {
  id: number
  name: string
  lastname: string
  email: string
  token: string
}

interface LoginPartnerDto {
  email: string
  password: string
}

interface UpdatePasswordPartnerDto {
  id: number
  password: string
}
```

### Fase 2: Servicios y API
**Archivo a crear:**
- `src/services/partnerService.ts`

**Métodos del servicio:**
1. `getPartnersPaginated(params)` - Lista paginada
2. `getAllPartners()` - Todos los partners (fallback)
3. `getPartnerById(id)` - Partner por ID
4. `getPartnerByToken(token)` - Partner por token
5. `createPartner(data)` - Crear partner
6. `updatePartner(data)` - Actualizar partner
7. `loginPartner(data)` - Login partner
8. `updatePartnerPassword(data)` - Actualizar contraseña

### Fase 3: Vista Principal de Partners
**Archivo a crear:**
- `src/views/PartnersView.vue`

**Funcionalidades:**
1. **Tabla de partners** con paginación
2. **Filtros de búsqueda** (nombre, apellido, email)
3. **Acciones por fila:**
   - Editar partner
   - Actualizar contraseña
   - Ver detalles
   - Activar/Desactivar (si aplica)
4. **Diálogo de creación/edición**
5. **Diálogo de actualización de contraseña**
6. **Gestión de estado de carga y errores**
7. **Integración con filtros locales** usando `useFilters`

### Fase 4: Integración con Router
**Archivo a modificar:**
- `src/router/index.ts`

**Ruta a agregar:**
```typescript
{
  path: '/partners',
  name: 'partners',
  component: () => import('@/views/PartnersView.vue'),
  meta: { requiresAuth: true }
}
```

### Fase 5: Navegación y Layout
**Archivos a modificar:**
- `src/layouts/AdminLayout.vue` (si existe menu de navegación)
- Agregar enlace a Partners en el menú principal

### Fase 6: Validaciones y Reglas de Negocio
**Validaciones del formulario:**
1. **Nombre:** requerido, min 2 caracteres, max 50
2. **Apellido:** requerido, min 2 caracteres, max 50
3. **Email:** requerido, formato email válido, único
4. **Contraseña:** requerida en creación, min 8 caracteres, debe incluir mayúscula, minúscula y número
5. **Token:** solo lectura en edición

### Fase 7: Funcionalidades Avanzadas (Opcional)
1. **Búsqueda por token** - Input especial para buscar por token
2. **Login de partner** - Formulario separado o modal
3. **Gestión de tokens** - Generar/renovar tokens
4. **Historial de actividad** - Si está disponible en el backend
5. **Exportación de datos** - CSV/Excel de partners

## Patrones de Diseño a Seguir

### 1. Consistencia con Events
- Usar la misma estructura de componentes que `EventsView.vue`
- Mantener el patrón de paginación frontend/backend
- Aplicar filtros locales con `useFilters`
- Gestión de estados (loading, error) similar

### 2. Principios DRY
- Reutilizar composables existentes (`useFilters`)
- Usar patrones de validación similares
- Mantener nomenclatura consistente

### 3. UX/UI
- Element Plus para todos los componentes
- Iconografía consistente
- Mensajes de confirmación para acciones destructivas
- Loading states apropiados

## Cronograma Estimado

| Fase | Descripción | Tiempo Estimado | Dependencias |
|------|-------------|-----------------|--------------|
| 1 | Tipos y DTOs | 30 min | - |
| 2 | Servicios API | 1 hora | Fase 1 |
| 3 | Vista Principal | 2-3 horas | Fases 1-2 |
| 4 | Integración Router | 15 min | Fase 3 |
| 5 | Navegación | 30 min | Fase 4 |
| 6 | Validaciones | 45 min | Fase 3 |
| 7 | Funcionalidades Avanzadas | 1-2 horas | Fases 1-6 |

**Total estimado:** 5-7 horas

## Consideraciones Técnicas

### 1. Soft Delete
- Implementar filtrado de partners eliminados (deleted: true)
- Similar al patrón usado en Events

### 2. Paginación
- Priorizar `getAllPartners()` para control completo en frontend
- Fallback a paginación backend si es necesario

### 3. Seguridad
- Validar permisos para operaciones CRUD
- No mostrar tokens completos en la tabla (truncar o enmascarar)
- Confirmar acciones sensibles (eliminar, cambiar contraseña)

### 4. Manejo de Errores
- Errores de validación específicos
- Manejo de partners duplicados (email)
- Timeout en operaciones de red

## Entregables por Fase

### Fase 1-2
- Tipos TypeScript definidos
- Servicio partnerService.ts funcional
- Pruebas básicas de conectividad API

### Fase 3-4
- Vista PartnersView.vue completamente funcional
- CRUD básico implementado
- Integración con router

### Fase 5-6
- Navegación integrada
- Validaciones completas
- UX pulida

### Fase 7
- Funcionalidades adicionales según prioridad
- Documentación actualizada

## Criterios de Aceptación

1. ✅ **Funcional:** Todas las operaciones CRUD funcionan correctamente
2. ✅ **UX:** Interfaz intuitiva y consistente con el resto de la aplicación
3. ✅ **Performance:** Carga rápida y paginación eficiente
4. ✅ **Validación:** Todas las entradas validadas correctamente
5. ✅ **Error Handling:** Manejo robusto de errores y estados de carga
6. ✅ **Responsive:** Funciona correctamente en diferentes tamaños de pantalla
7. ✅ **Accesibilidad:** Cumple estándares básicos de accesibilidad

## Notas Adicionales

- Mantener logs de debug durante desarrollo (remover en producción)
- Seguir convenciones de commits establecidas
- Probar cada fase antes de continuar con la siguiente
- Documentar cualquier limitación encontrada en el backend
