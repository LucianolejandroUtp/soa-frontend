# Integración Frontend-Backend SOA

## 🎯 **Backend Analizado: SOA-USERS**

### 📊 **Stack Tecnológico del Backend:**

- **Node.js + TypeScript + Express**
- **TypeORM con MySQL/PostgreSQL**
- **Socket.io** para tiempo real
- **Swagger** para documentación API
- **bcrypt** para encriptación de contraseñas
- **CORS** habilitado
- **Puerto:** 2221
- **Base URL:** http://localhost:2221/api

### 🔗 **Endpoints Mapeados:**

#### **Usuarios (`/users`)**

- `GET /users` - Obtener usuarios paginados
- `GET /users/:id` - Obtener usuario por ID
- `POST /users` - Crear nuevo usuario
- `PUT /users` - Actualizar usuario existente
- `DELETE /users/:id` - Borrado lógico de usuario

#### **Roles (`/roles`)**

- `GET /roles` - Obtener todos los roles
- `POST /roles` - Crear nuevo rol

### 📋 **Modelos de Datos:**

#### **User Entity:**

```typescript
{
  id: number (PK)
  name: string
  lastname: string
  email: string
  password: string (encriptada)
  rolId: number (FK)
  isActive: boolean
  deleted: boolean (soft delete)
  createdAt: Date
  updatedAt: Date
  rol?: Role (relación)
}
```

#### **Role Entity:**

```typescript
{
  id: number (PK)
  name: string
  isActive: boolean
  deleted: boolean (soft delete)
  createdAt: Date
  updatedAt: Date
}
```

## 🚀 **Integración Frontend Implementada**

### 📁 **Estructura Creada:**

```
src/
├── services/
│   ├── api.ts              # Configuración Axios
│   ├── userService.ts      # Servicio para usuarios
│   └── roleService.ts      # Servicio para roles
├── stores/
│   └── users.ts            # Store Pinia para gestión de estado
├── types/
│   └── api.ts              # Tipos TypeScript
└── views/
    └── UsersViewNew.vue    # Vista conectada al backend
```

### ⚙️ **Configuración de API:**

#### **Variables de Entorno (`.env.development`):**

```env
VITE_API_BASE_URL=http://localhost:2221/api
VITE_SOCKET_URL=http://localhost:2221
VITE_APP_TITLE=SOA Admin Panel
```

#### **Axios Setup:**

- Base URL configurada
- Interceptors para auth (preparado)
- Manejo global de errores
- Timeout de 10 segundos

### 🔧 **Servicios Implementados:**

#### **UserService:**

- `getUsers(params)` - Paginación y filtros
- `getUserById(id)` - Usuario específico
- `createUser(data)` - Crear con validación
- `updateUser(data)` - Actualizar parcial
- `deleteUser(id)` - Borrado lógico
- `searchUsers(term)` - Búsqueda

#### **RoleService:**

- `getRoles()` - Todos los roles activos
- `getRoleById(id)` - Rol específico
- `createRole(data)` - Crear nuevo rol

### 💾 **Store de Pinia:**

#### **Estado Reactivo:**

- Lista de usuarios paginada
- Roles disponibles
- Estados de carga
- Filtros aplicados
- Paginación actual

#### **Acciones Disponibles:**

- `fetchUsers()` - Cargar usuarios
- `createUser()` - Crear usuario
- `updateUser()` - Actualizar usuario
- `deleteUser()` - Eliminar usuario
- `updateFilters()` - Aplicar filtros
- `changePage()` - Cambiar página

### 🎨 **Vista UsersViewNew:**

#### **Funcionalidades:**

- ✅ Tabla paginada conectada al backend
- ✅ Filtros en tiempo real (búsqueda, rol, estado)
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Validación de formularios
- ✅ Manejo de errores con Element Plus
- ✅ Estados de carga
- ✅ Confirmaciones de eliminación

## 🔄 **Próximos Pasos**

### 1. **Iniciar Backend:**

```bash
cd docs-backend/SOA-USERS
npm install
npm run dev
```

### 2. **Configurar Base de Datos:**

- Crear BD MySQL: `SOA`
- Configurar `.env` con credenciales
- El backend creará las tablas automáticamente

### 3. **Funcionalidades Adicionales a Implementar:**

#### **Autenticación:**

- Login/Logout
- JWT tokens
- Guards de rutas
- Permisos por rol

#### **Socket.io Integration:**

- Notificaciones en tiempo real
- Actualizaciones automáticas
- Chat o mensajería

#### **Mejoras UX:**

- Filtros avanzados
- Exportación de datos
- Bulk operations
- Upload de archivos

## 🧪 **Testing**

Para probar la integración:

1. **Iniciar Backend:** `npm run dev` (puerto 2221)
2. **Iniciar Frontend:** `pnpm run dev` (puerto 5173)
3. **Navegar a:** http://localhost:5173/users
4. **Verificar:** Consola de red para llamadas API

## 🚨 **Troubleshooting**

### **CORS Issues:**

El backend ya tiene CORS configurado con `origin: "*"`

### **Conectividad:**

Verificar que ambos servicios estén corriendo:

- Backend: http://localhost:2221/api
- Frontend: http://localhost:5173

### **Base de Datos:**

Verificar conexión MySQL en `.env` del backend

¡La integración está completa y lista para usar! 🎉
