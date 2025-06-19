# Documentación API SOA-EVENTS

## Información General

**Base URL:** `http://localhost:2222/api`
**Documentación Swagger:** `http://localhost:2222/api-docs`

Esta API gestiona eventos, ubicaciones y la relación entre eventos y ubicaciones, además de proporcionar funcionalidades de WebSocket para comunicación en tiempo real.

## Tecnologías

- **Framework:** Express.js con TypeScript
- **Base de Datos:** MySQL con TypeORM
- **WebSockets:** Socket.IO
- **Validación:** class-validator
- **Transformación:** class-transformer
- **Documentación:** Swagger

---

## Endpoints

### 1. EVENTOS (`/api/events`)

#### 1.1 Obtener todos los eventos
- **GET** `/api/events`
- **Descripción:** Obtiene todos los eventos (incluidos inactivos)
- **Respuesta:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Concierto de Rock",
    "description": "Un evento musical con bandas en vivo",
    "startDate": "2025-07-01T18:00:00.000Z",
    "endDate": "2025-07-01T21:00:00.000Z",
    "saleStart": "2025-06-01T00:00:00.000Z",
    "saleEnd": "2025-06-30T23:59:59.000Z",
    "createdAt": "2025-06-18T10:00:00.000Z",
    "updatedAt": "2025-06-18T10:00:00.000Z",
    "isActive": true,
    "deleted": false,
    "eventLocations": []
  }
]
```

#### 1.2 Obtener eventos activos
- **GET** `/api/events/active`
- **Descripción:** Obtiene solo los eventos activos (isActive = true)
- **Respuesta:** `200 OK` - Mismo formato que el anterior, pero filtrado

#### 1.3 Obtener eventos paginados
- **GET** `/api/events/paginated?page={page}&items={items}`
- **Parámetros de consulta:**
  - `page` (number): Número de página (basado en 0)
  - `items` (number): Elementos por página
- **Ejemplo:** `/api/events/paginated?page=0&items=10`
- **Respuesta:** `200 OK`
```json
{
  "response": [
    {
      "id": 1,
      "name": "Concierto de Rock",
      "description": "Un evento musical con bandas en vivo",
      "startDate": "2025-07-01T18:00:00.000Z",
      "endDate": "2025-07-01T21:00:00.000Z",
      "saleStart": "2025-06-01T00:00:00.000Z",
      "saleEnd": "2025-06-30T23:59:59.000Z",
      "createdAt": "2025-06-18T10:00:00.000Z",
      "updatedAt": "2025-06-18T10:00:00.000Z",
      "isActive": true,
      "deleted": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### 1.4 Obtener evento por ID
- **GET** `/api/events/{id}`
- **Parámetros de ruta:**
  - `id` (number): ID del evento
- **Respuesta:** `200 OK` o `404 Not Found`

#### 1.5 Obtener evento por nombre
- **GET** `/api/events/name/{name}`
- **Parámetros de ruta:**
  - `name` (string): Nombre del evento
- **Respuesta:** `200 OK` o `404 Not Found`

#### 1.6 Obtener eventos por fecha de inicio
- **GET** `/api/events/start-date?date={date}`
- **Parámetros de consulta:**
  - `date` (string): Fecha en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Ejemplo:** `/api/events/start-date?date=2025-07-01T00:00:00.000Z`
- **Respuesta:** `200 OK` o `400 Bad Request`

#### 1.7 Obtener eventos por fecha de inicio de venta
- **GET** `/api/events/sale-start?date={date}`
- **Parámetros de consulta:**
  - `date` (string): Fecha en formato ISO
- **Respuesta:** `200 OK` o `400 Bad Request`

#### 1.8 Crear evento
- **POST** `/api/events`
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "name": "Concierto de Rock",
  "description": "Un evento musical con bandas en vivo",
  "start_date": "2025-07-01T18:00:00.000Z",
  "end_date": "2025-07-01T21:00:00.000Z",
  "sale_start": "2025-06-01T00:00:00.000Z",
  "sale_end": "2025-06-30T23:59:59.000Z"
}
```
- **Respuesta:** `201 Created`, `400 Bad Request`, o `409 Conflict` (si ya existe)

#### 1.9 Actualizar evento
- **PUT** `/api/events/{id}`
- **Parámetros de ruta:**
  - `id` (number): ID del evento
- **Body:** (todos los campos son opcionales excepto event_id)
```json
{
  "event_id": 1,
  "name": "Nuevo nombre del evento",
  "description": "Descripción actualizada",
  "start_date": "2025-07-01T18:00:00.000Z",
  "end_date": "2025-07-01T21:00:00.000Z",
  "sale_start": "2025-06-01T00:00:00.000Z",
  "sale_end": "2025-06-30T23:59:59.000Z",
  "is_active": true,
  "deleted": false
}
```
- **Respuesta:** `200 OK` o `400 Bad Request`

#### 1.10 Eliminar evento
- **DELETE** `/api/events/{id}`
- **Parámetros de ruta:**
  - `id` (number): ID del evento
- **Respuesta:** `200 OK` o `404 Not Found`
```json
{
  "message": "Event deleted"
}
```

#### 1.11 Activar evento
- **PATCH** `/api/events/{id}/activate`
- **Parámetros de ruta:**
  - `id` (number): ID del evento
- **Respuesta:** `200 OK` o `400 Bad Request`
```json
{
  "message": "Event activated"
}
```

#### 1.12 Desactivar evento
- **PATCH** `/api/events/{id}/deactivate`
- **Parámetros de ruta:**
  - `id` (number): ID del evento
- **Respuesta:** `200 OK` o `400 Bad Request`
```json
{
  "message": "Event deactivated"
}
```

---

### 2. UBICACIONES (`/api/locations`)

#### 2.1 Obtener todas las ubicaciones
- **GET** `/api/locations`
- **Respuesta:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Estadio Nacional",
    "capacity": 50000,
    "createdAt": "2025-06-18T10:00:00.000Z",
    "updatedAt": "2025-06-18T10:00:00.000Z",
    "isActive": true,
    "deleted": false,
    "eventLocations": []
  }
]
```

#### 2.2 Obtener ubicaciones activas
- **GET** `/api/locations/active`
- **Respuesta:** `200 OK` - Mismo formato, filtrado por activas

#### 2.3 Obtener ubicaciones paginadas
- **GET** `/api/locations/paginated?page={page}&items={items}`
- **Parámetros de consulta:**
  - `page` (number): Número de página (basado en 0)
  - `items` (number): Elementos por página
- **Respuesta:** `200 OK` - Formato paginado similar al de eventos

#### 2.4 Obtener ubicación por ID
- **GET** `/api/locations/{id}`
- **Parámetros de ruta:**
  - `id` (number): ID de la ubicación
- **Respuesta:** `200 OK` o `404 Not Found`

#### 2.5 Obtener ubicación por nombre
- **GET** `/api/locations/name/{name}`
- **Parámetros de ruta:**
  - `name` (string): Nombre de la ubicación
- **Respuesta:** `200 OK` o `404 Not Found`

#### 2.6 Crear ubicación
- **POST** `/api/locations`
- **Body:**
```json
{
  "name": "Estadio Nacional",
  "capacity": 50000
}
```
- **Respuesta:** `201 Created` o `400 Bad Request`

#### 2.7 Actualizar ubicación
- **PUT** `/api/locations/{id}`
- **Parámetros de ruta:**
  - `id` (number): ID de la ubicación
- **Body:**
```json
{
  "id": 1,
  "name": "Estadio Nacional",
  "capacity": 60000,
  "is_active": true,
  "deleted": false
}
```
- **Respuesta:** `200 OK` o `400 Bad Request`

#### 2.8 Eliminar ubicación
- **DELETE** `/api/locations/{id}`
- **Respuesta:** `200 OK` o `404 Not Found`

#### 2.9 Activar ubicación
- **PATCH** `/api/locations/{id}/activate`
- **Respuesta:** `200 OK` o `400 Bad Request`

#### 2.10 Desactivar ubicación
- **PATCH** `/api/locations/{id}/deactivate`
- **Respuesta:** `200 OK` o `400 Bad Request`

---

### 3. EVENTOS-UBICACIONES (`/api/event-locations`)

Esta entidad representa la relación entre eventos y ubicaciones con precios específicos.

#### 3.1 Obtener todas las relaciones evento-ubicación
- **GET** `/api/event-locations`
- **Respuesta:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Zona VIP",
    "price": 150.00,
    "createdAt": "2025-06-18T10:00:00.000Z",
    "updatedAt": "2025-06-18T10:00:00.000Z",
    "isActive": true,
    "deleted": false,
    "event": {
      "id": 1,
      "name": "Concierto de Rock"
    },
    "location": {
      "id": 2,
      "name": "Estadio Nacional"
    }
  }
]
```

#### 3.2 Obtener relaciones evento-ubicación paginadas
- **GET** `/api/event-locations/paginated?page={page}&items={items}`
- **Respuesta:** `200 OK` - Formato paginado

#### 3.3 Obtener relaciones por evento
- **GET** `/api/event-locations/event/{eventId}`
- **Parámetros de ruta:**
  - `eventId` (number): ID del evento
- **Respuesta:** `200 OK`

#### 3.4 Obtener relaciones por ubicación
- **GET** `/api/event-locations/location/{locationId}`
- **Parámetros de ruta:**
  - `locationId` (number): ID de la ubicación
- **Respuesta:** `200 OK`

#### 3.5 Obtener relaciones activas por evento
- **GET** `/api/event-locations/event/{eventId}/active`
- **Parámetros de ruta:**
  - `eventId` (number): ID del evento
- **Respuesta:** `200 OK`

#### 3.6 Obtener relación por ID
- **GET** `/api/event-locations/{id}`
- **Parámetros de ruta:**
  - `id` (number): ID de la relación
- **Respuesta:** `200 OK` o `404 Not Found`

#### 3.7 Crear relación evento-ubicación
- **POST** `/api/event-locations`
- **Body:**
```json
{
  "event_id": 1,
  "location_id": 2,
  "name": "Zona VIP",
  "price": 150.0
}
```
- **Respuesta:** `201 Created` o `400 Bad Request`

#### 3.8 Actualizar relación evento-ubicación
- **PUT** `/api/event-locations/{id}`
- **Parámetros de ruta:**
  - `id` (number): ID de la relación
- **Body:**
```json
{
  "event_location_id": 1,
  "event_id": 1,
  "location_id": 2,
  "name": "Zona General",
  "price": 80.0,
  "is_active": true,
  "deleted": false
}
```
- **Respuesta:** `200 OK` o `400 Bad Request`

#### 3.9 Eliminar relación evento-ubicación
- **DELETE** `/api/event-locations/{id}`
- **Respuesta:** `200 OK` o `404 Not Found`

#### 3.10 Activar relación evento-ubicación
- **PATCH** `/api/event-locations/{id}/activate`
- **Respuesta:** `200 OK` o `400 Bad Request`

#### 3.11 Desactivar relación evento-ubicación
- **PATCH** `/api/event-locations/{id}/deactivate`
- **Respuesta:** `200 OK` o `400 Bad Request`

---

### 4. WEBSOCKETS (`/api`)

Funcionalidades de comunicación en tiempo real usando Socket.IO.

#### 4.1 Refrescar stock
- **POST** `/api/refresh-stock`
- **Descripción:** Envía una señal de refresco de stock a todos los clientes conectados
- **Body:** No requiere
- **Respuesta:** `200 OK`
```json
{
  "status": true,
  "message": "refrescando stock"
}
```

#### 4.2 Enviar mensaje a usuario específico
- **POST** `/api/send-message`
- **Body:**
```json
{
  "userId": "user123",
  "message": "Hola usuario específico"
}
```
- **Respuesta:** `200 OK` o `400 Bad Request`
```json
{
  "success": true,
  "message": "Mensaje enviado"
}
```

#### 4.3 Enviar mensaje a sala específica
- **POST** `/api/send-room`
- **Body:**
```json
{
  "title": "Actualización de evento",
  "content": "El evento ha sido modificado",
  "saleId": 123,
  "room": "room-cayma"
}
```
- **Salas disponibles:**
  - `room-cayma`
  - `room-lambramani`
  - `room-refresh-stock`
- **Respuesta:** `200 OK` o `400 Bad Request`

#### 4.4 Enviar mensaje broadcast
- **POST** `/api/send-broadcast`
- **Descripción:** Envía un mensaje a todos los clientes conectados
- **Body:**
```json
{
  "title": "Anuncio general",
  "content": "Nuevo evento disponible",
  "saleId": 456
}
```
- **Respuesta:** `200 OK` o `400 Bad Request`
```json
{
  "status": true,
  "message": "Mensaje enviado"
}
```

---

## Estructura de Datos

### Evento
```typescript
{
  id: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  saleStart: Date;
  saleEnd: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deleted: boolean;
  eventLocations?: EventLocation[];
}
```

### Ubicación
```typescript
{
  id: number;
  name: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deleted: boolean;
  eventLocations?: EventLocation[];
}
```

### Evento-Ubicación
```typescript
{
  id: number;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deleted: boolean;
  event: Event;
  location: Location;
}
```

### Mensaje WebSocket
```typescript
{
  content: string;
  timestamp: Date;
  title: string;
  saleId: number;
}
```

---

## Códigos de Estado HTTP

- **200 OK:** Operación exitosa
- **201 Created:** Recurso creado exitosamente
- **400 Bad Request:** Datos de entrada inválidos
- **404 Not Found:** Recurso no encontrado
- **409 Conflict:** Conflicto (ej: recurso ya existe)
- **500 Internal Server Error:** Error interno del servidor

---

## Configuración del Cliente

### Variables de Entorno Requeridas
```properties
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=SOA
PORT=2222
SWAGGER_SERVER_URL=http://localhost:2222/api
```

### Configuración de WebSocket (Cliente)
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:2222');

// Escuchar mensajes
socket.on('message', (data) => {
  console.log('Mensaje recibido:', data);
});

// Unirse a una sala específica
socket.emit('join-room', 'room-cayma');

// Escuchar actualizaciones de stock
socket.on('refresh-stock', (data) => {
  console.log('Refrescar stock:', data);
});
```

### Ejemplo de Consumo con JavaScript/TypeScript

```javascript
// Obtener todos los eventos
const getAllEvents = async () => {
  try {
    const response = await fetch('http://localhost:2222/api/events');
    const events = await response.json();
    return events;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Crear un nuevo evento
const createEvent = async (eventData) => {
  try {
    const response = await fetch('http://localhost:2222/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    });
    const newEvent = await response.json();
    return newEvent;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Obtener eventos paginados
const getPaginatedEvents = async (page = 0, items = 10) => {
  try {
    const response = await fetch(`http://localhost:2222/api/events/paginated?page=${page}&items=${items}`);
    const paginatedEvents = await response.json();
    return paginatedEvents;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Notas Importantes

1. **Fechas:** Todas las fechas deben enviarse en formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
2. **Paginación:** Los índices de página comienzan en 0
3. **Soft Delete:** Los recursos no se eliminan físicamente, se marcan como `deleted: true`
4. **Estados:** Los recursos pueden estar activos (`isActive: true`) o inactivos
5. **WebSockets:** Las conexiones WebSocket se mantienen activas para comunicación en tiempo real
6. **Validación:** Todos los endpoints validan los datos de entrada usando class-validator
7. **CORS:** La API permite conexiones desde cualquier origen para WebSockets

---

## Instalación y Ejecución

1. Clonar el repositorio
2. Instalar dependencias: `pnpm install`
3. Configurar variables de entorno en `.env`
4. Compilar TypeScript: `npx tsc`
5. Ejecutar: `node dist/server.js`
6. La API estará disponible en `http://localhost:2222`
7. Documentación Swagger en `http://localhost:2222/api-docs`
