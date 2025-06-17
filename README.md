# 🚀 SOA Vue Project

> **Sistema de administración moderno desarrollado con Vue 3, TypeScript y Element Plus, integrado con arquitectura SOA (Service-Oriented Architecture)**

[![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element_Plus-409EFF?style=for-the-badge&logo=element&logoColor=white)](https://element-plus.org/)

---

## 📋 Índice

- [🎯 Descripción del Proyecto](#-descripción-del-proyecto)
- [✨ Características Principales](#-características-principales)
- [🏗️ Arquitectura y Tecnologías](#️-arquitectura-y-tecnologías)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔧 Scripts Disponibles](#-scripts-disponibles)
- [📚 Documentación](#-documentación)
- [🚀 Estado Actual del Proyecto](#-estado-actual-del-proyecto)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

---

## 🎯 Descripción del Proyecto

**SOA Vue Project** es un sistema de administración web moderno diseñado con arquitectura orientada a servicios. Proporciona una interfaz de usuario robusta para la gestión de usuarios, roles y autenticación, conectándose seamlessly con servicios backend SOA.

### 🎨 **Características del UI/UX:**

- **Diseño moderno y responsivo** con Element Plus
- **Tema consistente** con paleta de colores profesional
- **Navegación intuitiva** con rutas protegidas
- **Experiencia de usuario fluida** con animaciones y transiciones

### 🔒 **Sistema de Autenticación:**

- Registro de usuarios con validación robusta
- Login demo (interfaz completa, sin backend real)
- Recuperación de contraseña demo (UI completa)
- Gestión de roles automática (Cliente, Vendedor, Admin)

---

## ✨ Características Principales

### 🔐 **Autenticación y Autorización**

| Característica             | Estado           | Descripción                                   |
| -------------------------- | ---------------- | --------------------------------------------- |
| Registro de usuarios       | ✅ **Funcional** | Formulario con validación + backend SOA-USERS |
| Login                      | 🎨 **Demo**      | Interfaz completa, sin validación backend     |
| Recuperación de contraseña | 🎨 **Demo**      | UI completa, sin funcionalidad backend        |
| Gestión de roles           | ✅ **Funcional** | Asignación automática (Cliente ID:3)          |

### 👥 **Gestión de Usuarios**

| Característica | Estado          | Descripción                                |
| -------------- | --------------- | ------------------------------------------ |
| CRUD completo  | ✅ **Completo** | Crear, leer, actualizar, eliminar usuarios |
| Paginación     | ✅ **Completo** | Navegación eficiente con filtros           |
| Búsqueda       | ✅ **Completo** | Búsqueda en tiempo real                    |
| Validación     | ✅ **Completo** | Validación de formularios robusta          |

### 🎨 **Interfaz de Usuario**

| Característica            | Estado          | Descripción                                |
| ------------------------- | --------------- | ------------------------------------------ |
| Diseño responsivo         | ✅ **Completo** | Adaptable a todos los dispositivos         |
| Componentes reutilizables | ✅ **Completo** | Biblioteca de componentes con Element Plus |
| Navegación optimizada     | ✅ **Completo** | Router con lazy loading                    |
| Estados de carga          | ✅ **Completo** | Feedback visual completo                   |

### 🔧 **Integración Backend**

| Característica    | Estado           | Descripción                        |
| ----------------- | ---------------- | ---------------------------------- |
| API REST          | ✅ **Funcional** | Configuración con Axios            |
| Tipos TypeScript  | ✅ **Completo**  | Tipado completo para APIs          |
| Manejo de errores | ✅ **Completo**  | Sistema centralizado de errores    |
| Autenticación JWT | ⚠️ **Pendiente** | Infraestructura lista, sin backend |

---

## 🏗️ Arquitectura y Tecnologías

### 🎯 **Stack Principal**

| Tecnología       | Versión   | Propósito                            |
| ---------------- | --------- | ------------------------------------ |
| **Vue 3**        | `^3.5.13` | Framework principal reactivo         |
| **TypeScript**   | `~5.6.0`  | Tipado estático y desarrollo robusto |
| **Vite**         | `^6.0.1`  | Build tool y servidor de desarrollo  |
| **Element Plus** | `^2.10.2` | Biblioteca de componentes UI         |
| **Vue Router**   | `^4.5.0`  | Enrutamiento SPA                     |
| **Axios**        | `^1.7.9`  | Cliente HTTP para APIs               |

### 🔧 **Herramientas de Desarrollo**

| Herramienta             | Propósito                   |
| ----------------------- | --------------------------- |
| **ESLint**              | Linting y calidad de código |
| **Prettier**            | Formateo automático         |
| **Vitest**              | Framework de testing        |
| **TypeScript Compiler** | Verificación de tipos       |

### 🏛️ **Patrones Arquitectónicos**

- **Composition API**: Lógica reutilizable y mantenible
- **Service Layer**: Abstracción de APIs y lógica de negocio
- **Reactive State**: Gestión del estado con refs y reactive
- **Component-Based**: Arquitectura modular y escalable
- **TypeScript-First**: Desarrollo type-safe desde el diseño

---

## 🚀 Inicio Rápido

### 📋 **Prerrequisitos**

Asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **pnpm** (gestor de paquetes recomendado)
- **Git** para clonar el repositorio

### ⚡ **Instalación Express**

```bash
# 1. Clonar el repositorio
git clone https://github.com/LucianolejandroUtp/soa-frontend.git
cd soa-frontend

# 2. Instalar dependencias con pnpm
pnpm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env.local

# 4. Iniciar servidor de desarrollo
pnpm dev
```

### 🌐 **Acceso Local**

Una vez iniciado el servidor, accede a:

- **Frontend**: `http://localhost:5173`
- **Vite Dev Server**: Hot reload automático activado

### 🔗 **Configuración Backend (Opcional)**

Para integración completa con backend:

1. **Clonar y configurar [SOA-USERS](https://github.com/Sebastian609/SOA-USERS/)**
2. **Leer la guía**: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
3. **Configurar variables de entorno** con URLs del backend

---

## 📁 Estructura del Proyecto

```
soa-vue-project/
├── 📁 src/                     # Código fuente principal
│   ├── 📁 components/          # Componentes reutilizables
│   │   ├── HelloWorld.vue      # Componente de bienvenida
│   │   ├── TheWelcome.vue      # Componente de inicio
│   │   └── WelcomeItem.vue     # Item de bienvenida
│   ├── 📁 layouts/             # Layouts de aplicación
│   │   └── AdminLayout.vue     # Layout administrativo
│   ├── 📁 router/              # Configuración de rutas
│   │   └── index.ts            # Router principal
│   ├── 📁 services/            # Servicios y APIs
│   │   ├── api.ts              # Cliente HTTP configurado
│   │   ├── userService.ts      # Servicios de usuarios
│   │   └── roleService.ts      # Servicios de roles
│   ├── 📁 views/               # Vistas principales
│   ├── 📁 stores/              # Estado global (Pinia)
│   ├── 📁 types/               # Definiciones TypeScript
│   ├── 📁 assets/              # Recursos estáticos
│   ├── App.vue                 # Componente raíz
│   └── main.ts                 # Punto de entrada
├── 📁 public/                  # Archivos públicos
├── 📁 docs/                    # Documentación del proyecto
├── 📄 package.json             # Dependencias y scripts
├── 📄 vite.config.ts           # Configuración de Vite
├── 📄 tsconfig.json            # Configuración TypeScript
└── 📄 README.md                # Documentación principal
```

---

## 🔧 Scripts Disponibles

### 🚀 **Desarrollo**

```bash
# Servidor de desarrollo con hot reload
pnpm dev

# Servidor de desarrollo expuesto en red
pnpm dev --host
```

### 🏗️ **Build y Producción**

```bash
# Build para producción
pnpm build

# Preview del build de producción
pnpm preview

# Build con análisis de bundle
pnpm build --analyze
```

### 🧪 **Testing y Calidad**

```bash
# Ejecutar tests unitarios
pnpm test:unit

# Tests en modo watch
pnpm test:unit --watch

# Ejecutar linting
pnpm lint

# Verificación de tipos TypeScript
pnpm type-check
```

### 🔧 **Herramientas de Desarrollo**

```bash
# Formatear código con Prettier
pnpm format

# Fix automático de ESLint
pnpm lint --fix

# Limpiar node_modules y reinstalar
pnpm clean-install
```

---

## 📚 Documentación

### 📖 **Documentación del Proyecto**

- **[🔗 Integración Backend](./BACKEND_INTEGRATION.md)** - Guía completa para integrar el frontend con el backend SOA-USERS
- **[⚙️ Configuración Element Plus](./ELEMENT_PLUS_SETUP.md)** - Setup y personalización de Element Plus

### 🔗 **Referencias Externas**

- [📚 Vue 3 Documentation](https://vuejs.org/guide/)
- [📚 Element Plus Components](https://element-plus.org/en-US/component/button.html)
- [📚 TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [📚 Vite Configuration](https://vite.dev/config/)
- [📚 Vue Router Guide](https://router.vuejs.org/guide/)

---

## 🚀 Estado Actual del Proyecto

### ✅ **Completado**

- ✅ Configuración base del proyecto Vue 3 + TypeScript
- ✅ Integración de Element Plus con tema personalizado
- ✅ Sistema de routing con Vue Router
- ✅ Servicios para gestión de usuarios y roles
- ✅ Componentes base y layout administrativo
- ✅ Configuración de herramientas de desarrollo (ESLint, Prettier, Vitest)

### 🚧 **En Desarrollo**

- 🔄 Sistema de autenticación completo (actualmente demo)
- 🔄 Integración completa con backend SOA-USERS
- 🔄 Dashboard administrativo avanzado
- 🔄 Sistema de notificaciones en tiempo real

### 📋 **Roadmap**

| Fase       | Descripción                  | Estado             |
| ---------- | ---------------------------- | ------------------ |
| **Fase 1** | Setup base y componentes     | ✅ **Completado**  |
| **Fase 2** | Autenticación y autorización | 🚧 **En progreso** |
| **Fase 3** | Dashboard y analytics        | 📅 **Planificado** |
| **Fase 4** | Optimización y performance   | 📅 **Futuro**      |

---

## 🤝 Contribución

### 🔀 **Proceso de Contribución**

1. **Fork** del repositorio
2. **Crear rama** para la feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** con mensajes descriptivos: `git commit -m "feat: agregar nueva funcionalidad"`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. **Crear Pull Request** con descripción detallada

### 📝 **Estándares de Código**

- **Mensajes de commit**: Seguir [Conventional Commits](https://www.conventionalcommits.org/)
- **Estilo de código**: Prettier + ESLint (configuración automática)
- **TypeScript**: Tipado estricto requerido
- **Testing**: Tests unitarios para nuevas funcionalidades

### 🛠️ **Configuración de Desarrollo**

```bash
# Clonar tu fork
git clone https://github.com/LucianolejandroUtp/soa-vue-project.git

# Agregar upstream remoto
git remote add upstream https://github.com/original-repo/soa-vue-project.git

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**🔗 ¿Tienes preguntas?**

[📧 Reportar Bug](mailto:developer@example.com) • [💡 Solicitar Feature](mailto:developer@example.com) • [📖 Documentación](./docs/)

Desarrollado con ❤️ usando Vue 3 + TypeScript

</div>
