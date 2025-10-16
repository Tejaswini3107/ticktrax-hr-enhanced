<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ThemeProvider } from './components/ThemeProvider.vue';
import MobileAppWrapper from './components/mobile/MobileAppWrapper.vue';
import LoginScreen from './components/auth/LoginScreen.vue';
import DashboardLayout from './components/DashboardLayout.vue';
import EmployeeDashboard from './components/dashboards/EmployeeDashboard.vue';
import ManagerDashboard from './components/dashboards/ManagerDashboard.vue';
import AdminDashboard from './components/dashboards/AdminDashboard.vue';
import HRDashboard from './components/dashboards/HRDashboard.vue';
import ProfileDialog from './components/dialogs/ProfileDialog.vue';
import Toaster from './components/ui/sonner.vue';
import { toast } from 'vue-sonner';
import authManager from './services/authService.js';
import mobileService from './services/mobileService.js';
// import './utils/apiTest.js'; // Auto-test API connection - disabled to prevent startup API calls

const user = ref(null);
const currentView = ref("dashboard");

// Debug currentView changes
watch(currentView, (newView, oldView) => {
  // Navigation tracking
}, { immediate: true });

// Watch user changes
watch(user, (newUser, oldUser) => {
  // User state tracking
}, { immediate: true, deep: true });
const isProfileOpen = ref(false);
const isMobileApp = ref(false);

// Detect if we should use mobile layout
onMounted(() => {
  detectMobileEnvironment();
  
  // Listen for orientation changes
  window.addEventListener('orientationchange', detectMobileEnvironment);
  window.addEventListener('resize', detectMobileEnvironment);
});

const detectMobileEnvironment = () => {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent;
  
  // Detect mobile based on screen width and user agent
  isMobileApp.value = width <= 768 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

const handleLogin = (name, role) => {
  user.value = { name, role };
  setDashboard();
};

const handleLogout = async () => {
  try {
    await authManager.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    user.value = null;
    setDashboard();
    toast.success('Logged out successfully');
  }
};

const handleRoleChange = (newRole) => {
  if (user.value) {
    user.value = { ...user.value, role: newRole };
    setDashboard();
    toast.success(`Switched to ${newRole} role`);
  }
};

const handleProfileClick = () => {
  isProfileOpen.value = true;
};

const dashboardContent = computed(() => {
  if (!user.value) return null;
  switch (user.value.role) {
    case "employee":
      return EmployeeDashboard;
    case "manager":
      return ManagerDashboard;
    case "hr":
      return HRDashboard;
    case "admin":
      return AdminDashboard;
    default:
      return EmployeeDashboard;
  }
});

// Helper to set dashboard with trace for debugging unexpected resets
const setDashboard = () => {
  // Don't override the mobile wrapper's internal navigation when running
  // as a mobile app — MobileAppWrapper manages its own currentView.
  if (isMobileApp.value) {
    console.debug('[App] setDashboard skipped because running as mobile app');
    return;
  }

  console.debug('[App] setDashboard called - setting currentView to "dashboard"');
  console.trace('[App] setDashboard stack trace');
  currentView.value = "dashboard";
};

// Check for existing authentication on app startup
onMounted(async () => {
  try {
    // Only check for current user if already authenticated
    if (authManager.isAuthenticated()) {
      const current = await authManager.getCurrentUser();
      if (current && current.success && current.data) {
        const profile = current.data;
        user.value = {
          name: profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
          role: profile.role || 'employee'
        };
        setDashboard();
        toast.success('Welcome back!');
      }
    }
  } catch (error) {
    // No authenticated user on startup
  }
});
</script>

<template>
  <ThemeProvider>
    <!-- Mobile App Layout -->
    <MobileAppWrapper v-if="isMobileApp">
      <component
        :is="dashboardContent"
        :currentView="currentView"
        @update:currentView="currentView = $event"
        :currentRole="user?.role"
      />
    </MobileAppWrapper>

    <!-- Desktop Layout -->
    <div v-else>
      <div v-if="!user">
        <LoginScreen @login="handleLogin" />
      </div>
      <div v-else class="h-screen overflow-hidden">
        <DashboardLayout
          :currentRole="user.role"
          @update:currentRole="handleRoleChange"
          :userName="user.name"
          :notifications="3"
          :currentView="currentView"
          @update:currentView="currentView = $event"
          @logout="handleLogout"
          @profileClick="handleProfileClick"
        >
          <component
            :is="dashboardContent"
            :currentView="currentView"
            @update:currentView="currentView = $event"
            :currentRole="user.role"
          />
        </DashboardLayout>
      </div>
    </div>

    <!-- Profile Dialog (shared) -->
    <ProfileDialog
      v-if="user"
      :open="isProfileOpen"
      @update:open="isProfileOpen = $event"
      :user="{
        name: user.name,
        role: user.role,
        email: `${user.name.toLowerCase().replace(' ', '.')}@company.com`,
        phone: '+1 (555) 123-4567',
        department: 'Engineering',
        location: 'New York, NY',
        startDate: '2023-01-15',
        employeeId: 'EMP001',
      }"
    />
    
    <Toaster />
  </ThemeProvider>
</template>
