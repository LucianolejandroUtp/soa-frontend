<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <h3 v-if="!isCollapse">Mi Admin</h3>
        <span v-else>MA</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
        :unique-opened="true"
        :collapse-transition="true"
        @open="handleSubMenuOpen"
        @close="handleSubMenuClose"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <template #title>Dashboard</template>
        </el-menu-item>

        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>Usuarios</template>
        </el-menu-item>
        <el-menu-item index="/roles">
          <el-icon><UserFilled /></el-icon>
          <template #title>Roles</template>
        </el-menu-item>

        <el-divider />

        <el-menu-item index="/events">
          <el-icon><Calendar /></el-icon>
          <template #title>Eventos</template>
        </el-menu-item>
        <el-menu-item index="/locations">
          <el-icon><Location /></el-icon>
          <template #title>Ubicaciones</template>
        </el-menu-item>

        <el-menu-item index="/event-locations">
          <el-icon><Connection /></el-icon>
          <template #title>Relaciones</template>
        </el-menu-item>

        <el-divider />

        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>Configuración</template>
        </el-menu-item>

        <el-menu-item index="/about">
          <el-icon><InfoFilled /></el-icon>
          <template #title>Acerca de</template>
        </el-menu-item>

        <!-- Enlaces temporales para testing -->
        <el-divider />
        <el-sub-menu index="auth-testing">
          <template #title>
            <el-icon><User /></el-icon>
            <span>🧪 Testing Auth</span>
          </template>
          <el-menu-item index="/login">
            <template #title>Login</template>
          </el-menu-item>
          <el-menu-item index="/register">
            <template #title>Registro</template>
          </el-menu-item>
          <el-menu-item index="/forgot-password">
            <template #title>Recuperar Pass</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- Main Content -->
    <div class="main-container">
      <!-- Header -->
      <el-header class="app-header">
        <div class="header-left">
          <el-button type="default" @click="toggleSidebar" class="sidebar-toggle">
            <el-icon><Fold /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">Inicio</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown>
            <div class="user-info">
              <span class="user-name">{{ currentUser?.name || currentUser?.email || 'Usuario' }}</span>
              <el-avatar
                :size="40"
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
              />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">
                  <el-icon><User /></el-icon>
                  Mi Perfil
                </el-dropdown-item>
                <el-dropdown-item @click="handleSettings">
                  <el-icon><Setting /></el-icon>
                  Configuración
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  Cerrar Sesión
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <!-- Page Content -->
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { AuthService } from '@/services/authService'
import {
  House,
  User,
  UserFilled,
  Setting,
  InfoFilled,
  Fold,
  Calendar,
  Location,
  Connection,
  SwitchButton,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

// Obtener información del usuario autenticado
const currentUser = computed(() => {
  return AuthService.getUser()
})

const activeMenu = computed(() => route.path)

const currentPageTitle = computed(() => {
  const routeMap: { [key: string]: string } = {
    '/': 'Dashboard',
    '/users': 'Usuarios',
    '/users/create': 'Crear Usuario',
    '/roles': 'Roles',
    '/events': 'Eventos',
    '/locations': 'Ubicaciones',
    '/event-locations': 'Relaciones Evento-Ubicación',
    '/settings': 'Configuración',
    '/about': 'Acerca de',
  }
  return routeMap[route.path] || 'Página'
})

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// Handlers para eventos del menú (mejora la UX)
const handleSubMenuOpen = (index: string) => {
  console.log('Submenú abierto:', index)
}

const handleSubMenuClose = (index: string) => {
  console.log('Submenú cerrado:', index)
}

// Handlers para el dropdown del usuario
const handleProfile = () => {
  console.log('👤 Navegando a perfil...')
  ElMessage.info('Funcionalidad de perfil próximamente')
  // router.push('/profile') // Cuando se implemente la vista de perfil
}

const handleSettings = () => {
  console.log('⚙️ Navegando a configuración...')
  router.push('/settings')
}

const handleLogout = async () => {
  try {
    const result = await ElMessageBox.confirm(
      '¿Estás seguro de que quieres cerrar sesión?',
      'Confirmar Logout',
      {
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
        type: 'warning',
        center: true
      }
    )

    if (result === 'confirm') {
      console.log('🚪 Cerrando sesión...')
      
      // Usar AuthService para cerrar sesión
      AuthService.logout()
      
      ElMessage.success('Sesión cerrada correctamente')
      
      // Redirigir al login
      router.push('/login')
    }
  } catch (error) {
    // Usuario canceló o cerró el diálogo
    console.log('❌ Logout cancelado')
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s ease-in-out;
  flex-shrink: 0;
  height: 100vh;
  overflow-y: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 60px);
  width: 100%;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #263445;
  color: white;
  font-weight: bold;
}

.app-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  width: 100%;
  height: 60px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sidebar-toggle {
  font-size: 18px;
}

.page-content {
  background-color: #f5f5f5;
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  width: 100%;
}

/* Estilos para el dropdown del usuario */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f5f5;
}

:deep(.el-dropdown-menu__item.is-divided) {
  border-top: 1px solid #e4e7ed;
  margin-top: 6px;
  padding-top: 12px;
}
</style>
