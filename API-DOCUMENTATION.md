# API SOA-USERS - Documentación Completa de Endpoints

## 🚀 **Información General**
- **Base URL:** `http://localhost:2221`
- **Puerto:** 2221
- **Tecnologías:** Node.js, TypeScript, Express, Socket.IO, TypeORM, MySQL

---

## 👥 **USUARIOS** (`/api/users`)

### **GET** `/api/users` - Lista paginada de usuarios
- **Query Parameters:**
  - `page` (number, required): Número de página (empieza en 1)
  - `items` (number, required): Número de elementos por página
- **Respuesta:** Array de usuarios con paginación
- **Código de estado:** 200

**Ejemplo de solicitud:**
```
GET /api/users?page=1&items=10
```

**Ejemplo de respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Juan",
      "lastname": "Pérez",
      "email": "juan@example.com",
      "isActive": true,
      "rolId": 1,
      "deleted": false,
      "createdAt": "2025-06-17T18:00:00.000Z",
      "updatedAt": "2025-06-17T18:00:00.000Z",
      "rol": {
        "id": 1,
        "name": "Administrator"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

### **GET** `/api/users/:id` - Usuario por ID
- **Path Parameter:**
  - `id` (number, required): ID del usuario
- **Respuesta:** Objeto usuario completo
- **Códigos de estado:** 200, 400

**Ejemplo de solicitud:**
```
GET /api/users/1
```

**Ejemplo de respuesta:**
```json
{
  "id": 1,
  "name": "Juan",
  "lastname": "Pérez",
  "email": "juan@example.com",
  "isActive": true,
  "rolId": 1,
  "deleted": false,
  "createdAt": "2025-06-17T18:00:00.000Z",
  "updatedAt": "2025-06-17T18:00:00.000Z",
  "rol": {
    "id": 1,
    "name": "Administrator",
    "isActive": true,
    "deleted": false,
    "createdAt": "2025-06-17T18:00:00.000Z",
    "updatedAt": "2025-06-17T18:00:00.000Z"
  }
}
```

### **POST** `/api/users` - Crear usuario
- **Body (JSON):**
  ```json
  {
    "name": "string",        // REQUERIDO, no vacío
    "lastname": "string",    // REQUERIDO, no vacío  
    "email": "string",       // REQUERIDO, no vacío
    "password": "string",    // REQUERIDO, no vacío
    "rol_id": number        // REQUERIDO, ID del rol
  }
  ```
- **Validaciones:**
  - Todos los campos son obligatorios
  - Email debe ser único en el sistema
- **Códigos de estado:** 201 (creado), 409 (email ya existe), 400 (error)

**Ejemplo de solicitud:**
```json
{
  "name": "Juan",
  "lastname": "Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "rol_id": 1
}
```

### **PUT** `/api/users` - Actualizar usuario
- **Body (JSON):**
  ```json
  {
    "id": number,           // REQUERIDO
    "name": "string",       // OPCIONAL
    "email": "string",      // OPCIONAL
    "lastname": "string",   // OPCIONAL
    "rol_id": number       // OPCIONAL
  }
  ```
- **Validaciones:**
  - El campo `id` es obligatorio
  - Solo se procesan campos definidos en el DTO (campos extra se ignoran automáticamente)
  - Usa `class-transformer` con `excludeExtraneousValues: true` para mayor seguridad
- **Códigos de estado:** 201, 400

**Ejemplo de solicitud válida:**
```json
{
  "id": 1,
  "name": "Juan Carlos",
  "email": "juancarlos@example.com"
}
```

**Ejemplo con campos extra (se ignorarán automáticamente):**
```json
{
  "id": 1,
  "name": "Juan Carlos",
  "maliciousField": "hack",  // ← IGNORADO por seguridad
  "extraData": "test"        // ← IGNORADO automáticamente
}
```

### **DELETE** `/api/users/:id` - Eliminar usuario (soft delete)
- **Path Parameter:**
  - `id` (number, required): ID del usuario
- **Códigos de estado:** 200, 400

**Ejemplo de solicitud:**
```
DELETE /api/users/1
```

### **POST** `/api/users/update-password` - Actualizar contraseña
- **Body (JSON):**
  ```json
  {
    "id": number,          // REQUERIDO
    "password": "string"   // REQUERIDO
  }
  ```
- **Códigos de estado:** 200, 400

**Ejemplo de solicitud:**
```json
{
  "id": 1,
  "password": "nuevaPassword123"
}
```

---

## 🔐 **ROLES** (`/api/roles`)

### **GET** `/api/roles` - Obtener todos los roles
- **Query Parameters (opcional):**
  - `active=true`: Solo roles activos
- **Respuesta:** Array de roles
- **Códigos de estado:** 200, 500

**Ejemplos de solicitud:**
```
GET /api/roles
GET /api/roles?active=true
```

**Ejemplo de respuesta:**
```json
[
  {
    "id": 1,
    "name": "Administrator",
    "isActive": true,
    "deleted": false,
    "createdAt": "2025-06-17T18:00:00.000Z",
    "updatedAt": "2025-06-17T18:00:00.000Z"
  },
  {
    "id": 2,
    "name": "User",
    "isActive": true,
    "deleted": false,
    "createdAt": "2025-06-17T18:00:00.000Z",
    "updatedAt": "2025-06-17T18:00:00.000Z"
  }
]
```

### **GET** `/api/roles/:id` - Rol por ID
- **Path Parameter:**
  - `id` (number, required): ID del rol
- **Códigos de estado:** 200, 404 (no encontrado), 500

**Ejemplo de solicitud:**
```
GET /api/roles/1
```

**Ejemplo de respuesta:**
```json
{
  "id": 1,
  "name": "Administrator",
  "isActive": true,
  "deleted": false,
  "createdAt": "2025-06-17T18:00:00.000Z",
  "updatedAt": "2025-06-17T18:00:00.000Z"
}
```

### **POST** `/api/roles` - Crear rol
- **Body (JSON):**
  ```json
  {
    "name": "string"         // REQUERIDO
  }
  ```
- **Validaciones:**
  - El campo `name` es obligatorio
  - El nombre del rol debe ser único
- **Códigos de estado:** 201, 409 (nombre ya existe), 400

**Ejemplo de solicitud:**
```json
{
  "name": "Editor"
}
```

### **PUT** `/api/roles/:id` - Actualizar rol
- **Path Parameter:**
  - `id` (number, required): ID del rol
- **Body (JSON):**
  ```json
  {
    "name": "string"         // OPCIONAL
  }
  ```
- **Códigos de estado:** 200, 404, 409, 400

**Ejemplo de solicitud:**
```json
{
  "name": "Super Administrator"
}
```

### **DELETE** `/api/roles/:id` - Eliminar rol
- **Path Parameter:**
  - `id` (number, required): ID del rol
- **Códigos de estado:** 204 (sin contenido), 404, 500

**Ejemplo de solicitud:**
```
DELETE /api/roles/1
```

### **POST** `/api/roles/:id/deactivate` - Desactivar rol
- **Path Parameter:**
  - `id` (number, required): ID del rol
- **Body:** No requiere datos
- **Códigos de estado:** 204, 404, 500

**Ejemplo de solicitud:**
```
POST /api/roles/1/deactivate
```

### **POST** `/api/roles/:id/activate` - Activar rol
- **Path Parameter:**
  - `id` (number, required): ID del rol
- **Body:** No requiere datos
- **Códigos de estado:** 204, 404, 500

**Ejemplo de solicitud:**
```
POST /api/roles/1/activate
```

---

## 📡 **SOCKET/MENSAJES** (`/api`)

### **POST** `/api/send-message` - Enviar mensaje a usuario específico
- **Body (JSON):**
  ```json
  {
    "userId": "string",     // REQUERIDO
    "message": "string"     // REQUERIDO
  }
  ```
- **Códigos de estado:** 200, 400 ("Faltan datos")

**Ejemplo de solicitud:**
```json
{
  "userId": "user123",
  "message": "Hola, este es un mensaje directo"
}
```

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "message": "Mensaje enviado"
}
```

### **POST** `/api/send-room` - Enviar mensaje a sala específica
- **Body (JSON):**
  ```json
  {
    "title": "string",      // REQUERIDO
    "content": "string",    // REQUERIDO
    "saleId": number,       // REQUERIDO
    "room": "string"        // REQUERIDO
  }
  ```
- **Códigos de estado:** 200, 400

**Ejemplo de solicitud:**
```json
{
  "title": "Nueva venta",
  "content": "Se ha registrado una nueva venta",
  "saleId": 12345,
  "room": "sales-room"
}
```

**Ejemplo de respuesta:**
```json
{
  "status": true,
  "message": "Mensaje enviado"
}
```

### **POST** `/api/send-broadcast` - Enviar mensaje broadcast
- **Body (JSON):**
  ```json
  {
    "title": "string",      // REQUERIDO
    "content": "string",    // REQUERIDO
    "saleId": number        // REQUERIDO
  }
  ```
- **Códigos de estado:** 200, 400

**Ejemplo de solicitud:**
```json
{
  "title": "Anuncio general",
  "content": "Mantenimiento programado a las 2:00 AM",
  "saleId": 0
}
```

**Ejemplo de respuesta:**
```json
{
  "status": true,
  "message": "Mensaje enviado"
}
```

### **POST** `/api/refresh-stock` - Refrescar stock
- **Body:** No requiere datos
- **Códigos de estado:** 200

**Ejemplo de solicitud:**
```
POST /api/refresh-stock
```

**Ejemplo de respuesta:**
```json
{
  "status": true,
  "message": "refrescando stock"
}
```

---

## 📊 **ESTRUCTURA DE DATOS DETALLADA**

### **Entidad Usuario:**
```typescript
{
  id: number,              // Auto-incremental, primary key
  name: string,            // Nombre del usuario
  lastname: string,        // Apellido del usuario
  email: string,           // Email único del usuario
  password: string,        // Contraseña encriptada (bcrypt)
  isActive: boolean,       // Estado activo/inactivo
  rolId: number,           // ID del rol asignado (foreign key)
  deleted: boolean,        // Soft delete flag
  createdAt: Date,         // Fecha de creación
  updatedAt: Date,         // Fecha de última actualización
  rol: Role               // Objeto rol relacionado
}
```

### **Entidad Rol:**
```typescript
{
  id: number,              // Auto-incremental, primary key
  name: string,            // Nombre del rol (único)
  isActive: boolean,       // Estado activo/inactivo (default: true)
  deleted: boolean,        // Soft delete flag (default: false)
  createdAt: Date,         // Fecha de creación
  updatedAt: Date,         // Fecha de última actualización
  users: User[]           // Array de usuarios con este rol
}
```

### **DTOs para Usuarios:**

#### **CreateUserDto:**
```typescript
{
  name: string,            // REQUERIDO
  lastname: string,        // REQUERIDO
  email: string,           // REQUERIDO
  password: string,        // REQUERIDO
  rol_id: number          // REQUERIDO
}
```

#### **UpdateUserDto:**
```typescript
{
  id: number,              // REQUERIDO - @IsNotEmpty() @IsNumber()
  name?: string,           // OPCIONAL - @IsString() @IsOptional()
  email?: string,          // OPCIONAL - @IsEmail() @IsOptional()
  lastname?: string,       // OPCIONAL - @IsString() @IsOptional()
  rol_id?: number         // OPCIONAL - @IsNumber() @IsOptional()
}
```

**⚠️ Importante:** Este DTO usa `class-transformer` con `excludeExtraneousValues: true`, lo que significa:
- Solo campos marcados con `@Expose()` son procesados
- Campos extra en el request son ignorados automáticamente
- Proporciona protección contra ataques de mass assignment

### **Modelos para Socket:**

#### **Message Model:**
```typescript
{
  userId: string,          // ID del usuario destinatario
  message: string,         // Contenido del mensaje
  timestamp?: Date        // Fecha del mensaje
}
```

#### **Room Model:**
```typescript
{
  title: string,           // Título del mensaje
  content: string,         // Contenido del mensaje
  saleId: number,          // ID de la venta relacionada
  room: string,           // Nombre de la sala
  timestamp?: Date        // Fecha del mensaje
}
```

---

## ⚠️ **CÓDIGOS DE ERROR COMUNES**

- **200:** Operación exitosa
- **201:** Recurso creado exitosamente
- **204:** Operación exitosa sin contenido
- **400:** Datos inválidos o faltantes
- **404:** Recurso no encontrado
- **409:** Conflicto (ej: email ya existe)
- **500:** Error interno del servidor

---

## 🔍 **VALIDACIONES IMPORTANTES**

### **Para Usuarios:**
- El email debe ser único en todo el sistema
- Todos los campos son requeridos al crear un usuario
- El rol_id debe existir en la tabla de roles
- La contraseña se encripta automáticamente con bcrypt
- El soft delete se usa en lugar de eliminar físicamente
- **Actualización de usuarios**: Usa `class-transformer` con protección contra campos maliciosos
- Solo campos definidos en el DTO con `@Expose()` son procesados en actualizaciones

### **Para Roles:**
- El nombre del rol debe ser único
- Por defecto isActive es true y deleted es false
- No se puede eliminar un rol que tenga usuarios asignados

### **Para Socket/Mensajes:**
- Todos los campos marcados como REQUERIDO deben estar presentes
- Los mensajes se envían en tiempo real a través de WebSocket
- El sistema maneja tanto mensajes directos como broadcast

---

## 🔌 **WebSocket Events**

El proyecto incluye Socket.IO para comunicación en tiempo real:

### **Eventos emitidos desde el servidor:**
- `message` - Mensaje directo a un usuario específico
- `room-message` - Mensaje a una sala específica
- `broadcast` - Mensaje broadcast a todos los usuarios conectados
- `refresh-stock` - Evento para refrescar stock

### **Conexión WebSocket:**
```javascript
// Cliente JavaScript
const socket = io('http://localhost:2221');

// Escuchar mensajes
socket.on('message', (data) => {
  console.log('Mensaje recibido:', data);
});

socket.on('broadcast', (data) => {
  console.log('Broadcast recibido:', data);
});
```

---

## 🛠️ **Headers Recomendados**

Para todas las peticiones HTTP:
```
Content-Type: application/json
Accept: application/json
```

---

## 🚀 **Configuración Base de Datos**

### **Tabla: tbl_users**
```sql
CREATE TABLE tbl_users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  rol_id INT NOT NULL,
  deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES tbl_roles(rol_id)
);
```

### **Tabla: tbl_roles**
```sql
CREATE TABLE tbl_roles (
  rol_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 📝 **Notas Adicionales**

1. **Paginación:** Los endpoints que devuelven listas incluyen información de paginación
2. **Soft Delete:** Se usa eliminación lógica (campo `deleted`) en lugar de eliminar registros físicamente
3. **Encriptación:** Las contraseñas se encriptan automáticamente con bcrypt
4. **Relaciones:** Los usuarios tienen una relación many-to-one con roles
5. **WebSocket:** Los endpoints de socket también funcionan como API REST normales
6. **Validación:** Todos los DTOs incluyen validaciones de tipo y requerimientos
7. **Timestamps:** Todas las entidades incluyen campos de fecha de creación y actualización automáticos
8. **Seguridad:** Los endpoints de actualización usan `class-transformer` con `excludeExtraneousValues: true`
9. **Protección Mass Assignment:** Solo campos explícitamente definidos con `@Expose()` son procesados

---

## 🔒 **Características de Seguridad Implementadas**

### **Transformación Segura de Datos:**
```typescript
// En updateUser - Último commit
const data = plainToInstance(UpdateUserDto, req.body, {
  excludeExtraneousValues: true 
});
```

### **Beneficios:**
- **Prevención de Mass Assignment:** Campos no definidos son ignorados
- **Validación Estricta:** Solo datos válidos pasan al servicio
- **Filtrado Automático:** Propiedades maliciosas son eliminadas silenciosamente
- **Consistencia de Tipos:** Los datos se transforman según las reglas del DTO

### **Ejemplo de Protección:**
```json
// Request enviado:
{
  "id": 1,
  "name": "Juan",
  "isAdmin": true,           // ← Campo malicioso
  "password": "hack123",     // ← Intento de cambiar password
  "extraField": "malware"    // ← Campo extra no válido
}

// Datos procesados (solo campos válidos del DTO):
{
  "id": 1,
  "name": "Juan"
}
```

---

**Última actualización:** 17 de junio de 2025

---

## 🆕 **Cambios Recientes**

### **Versión Actual (Último Commit):**
- ✅ **Seguridad mejorada** en actualización de usuarios con `class-transformer`
- ✅ **Protección contra Mass Assignment** con `excludeExtraneousValues: true`
- ✅ **Validación más estricta** de campos en requests
- ✅ **Filtrado automático** de propiedades maliciosas o no válidas
- ✅ **Documentación completa** de todos los endpoints funcionales

### **Recomendaciones para Desarrollo Frontend:**
1. **Envía solo campos necesarios** según los DTOs definidos
2. **No dependas de campos extra** - serán ignorados automáticamente
3. **Respeta los tipos de datos** exactos (number, string, boolean)
4. **Incluye validación del lado cliente** para mejor UX
5. **Maneja errores 400** que pueden indicar datos mal formateados
