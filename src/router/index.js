import { createRouter, createWebHistory } from 'vue-router'
import authManager from '../services/authService.js'

// Import components
import LoginScreen from '../components/auth/LoginScreen.vue'
import DashboardLayout from '../components/DashboardLayout.vue'
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard.vue'
import ManagerDashboard from '../components/dashboards/ManagerDashboard.vue'
import AdminDashboard from '../components/dashboards/AdminDashboard.vue'
import ProfileDialog from '../components/dialogs/ProfileDialog.vue'

// Define routes with authentication requirements
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginScreen,
    meta: { 
      requiresAuth: false,
      title: 'Login - TickTrax'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard', 
    component: DashboardLayout,
    meta: { 
      requiresAuth: true,
      title: 'Dashboard - TickTrax'
    },
    children: [
      {
        path: '',
        name: 'DashboardHome',
        component: EmployeeDashboard, // Default dashboard
        meta: { requiresAuth: true }
      },
      {
        path: 'employee',
        name: 'EmployeeDashboard',
        component: EmployeeDashboard,
        meta: { 
          requiresAuth: true,
          requiresRole: ['employee', 'manager', 'admin']
        }
      },
      {
        path: 'manager',
        name: 'ManagerDashboard', 
        component: ManagerDashboard,
        meta: { 
          requiresAuth: true,
          requiresRole: ['manager', 'admin']
        }
      },
      {
        path: 'admin',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { 
          requiresAuth: true,
          requiresRole: ['admin']
        }
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileDialog,
    meta: { 
      requiresAuth: true,
      title: 'Profile - TickTrax'
    }
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('../components/auth/UnauthorizedScreen.vue'),
    meta: {
      requiresAuth: false,
      title: 'Unauthorized - TickTrax'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../components/auth/NotFoundScreen.vue'),
    meta: {
      requiresAuth: false,
      title: 'Page Not Found - TickTrax'
    }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when changing pages
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guards - CRITICAL SECURITY IMPLEMENTATION
router.beforeEach(async (to, from, next) => {
  console.log('🔐 Router beforeEach: Navigating from', from.path, 'to', to.path)
  
  // Set document title
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    console.log('🔐 Route requires authentication, checking...')
    
    try {
      // Check if user is authenticated
      const isAuthenticated = await authManager.isAuthenticated()
      
      if (!isAuthenticated) {
        console.log('🔐 User not authenticated, redirecting to login')
        // Redirect to login with return URL
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }

      // Get current user info for role-based access
      const currentUser = await authManager.getCurrentUser()
      
      if (!currentUser || !currentUser.success) {
        console.log('🔐 Failed to get user info, redirecting to login')
        next('/login')
        return
      }

      // Check role-based access
      if (to.meta.requiresRole) {
        const userRole = currentUser.data.role || 'employee'
        const requiredRoles = Array.isArray(to.meta.requiresRole) 
          ? to.meta.requiresRole 
          : [to.meta.requiresRole]
        
        if (!requiredRoles.includes(userRole)) {
          console.log('🔐 Insufficient permissions. User role:', userRole, 'Required:', requiredRoles)
          next('/unauthorized')
          return
        }
      }

      console.log('✅ Authentication and authorization passed')
      next()
      
    } catch (error) {
      console.error('🔐 Authentication check failed:', error)
      next('/login')
    }
  } else {
    // Public route - check if already authenticated and trying to access login
    if (to.path === '/login') {
      try {
        const isAuthenticated = await authManager.isAuthenticated()
        if (isAuthenticated) {
          // Already logged in, redirect to dashboard
          next('/dashboard')
          return
        }
      } catch (error) {
        // Continue to login if auth check fails
        console.log('Auth check failed for login route, continuing...')
      }
    }
    
    next()
  }
})

// After navigation guard - for logging and analytics
router.afterEach((to, from) => {
  console.log('📊 Navigation completed:', from.path, '->', to.path)
  
  // Track page views (could integrate with analytics)
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to.path
    })
  }
})

// Handle navigation errors
router.onError((error) => {
  console.error('🔥 Router error:', error)
  
  // Could show user-friendly error message
  // router.push('/error')
})

export default router