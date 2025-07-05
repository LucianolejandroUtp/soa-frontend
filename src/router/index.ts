import { createRouter, createWebHistory } from 'vue-router'
import { AuthService } from '@/services/authService'
import AdminLayout from '../layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Authentication routes (public)
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
      meta: { requiresGuest: true },
    },
    // Protected routes (require authentication)
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/UsersView.vue'),
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('../views/RolesView.vue'),
        },
        {
          path: 'events',
          name: 'events',
          component: () => import('../views/EventsView.vue'),
        },
        {
          path: 'locations',
          name: 'locations',
          component: () => import('../views/LocationsView.vue'),
        },
        {
          path: 'event-locations',
          name: 'event-locations',
          component: () => import('../views/EventLocationsView.vue'),
        },
        {
          path: 'partners',
          name: 'partners',
          component: () => import('../views/PartnersView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/AboutView.vue'), // Temporal
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
        },
      ],
    },
  ],
})

// Guards de navegación
router.beforeEach(async (to, from, next) => {
  const token = AuthService.getToken()
  const isAuthenticated = AuthService.isAuthenticated()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  console.log('🛡️ Route guard:', {
    to: to.path,
    from: from.path,
    token: token ? 'presente' : 'ausente',
    isAuthenticated,
    requiresAuth,
    requiresGuest
  })

  // Evitar bucles de redirección infinitos
  if (from.path === '/login' && to.path === '/login') {
    console.log('⚠️ Evitando bucle infinito en login')
    next()
    return
  }

  if (requiresAuth && !isAuthenticated) {
    // Ruta protegida sin autenticación -> ir a login
    if (to.path !== '/login') {
      console.log('🚫 Acceso denegado - redirigiendo a login')
      next('/login')
    } else {
      next()
    }
  } else if (requiresGuest && isAuthenticated) {
    // Ruta de invitado estando autenticado -> ir a dashboard
    if (to.path === '/login' || to.path === '/register' || to.path === '/forgot-password') {
      console.log('✅ Ya autenticado - redirigiendo a dashboard')
      next('/')
    } else {
      next()
    }
  } else {
    // Permitir navegación
    console.log('✅ Navegación permitida')
    next()
  }
})

export default router
