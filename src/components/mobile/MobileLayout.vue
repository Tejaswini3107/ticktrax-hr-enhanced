<template>
  <div class="mobile-app min-h-screen bg-background">
    <!-- Mobile Header -->
    <header class="mobile-header sticky top-0 z-50 bg-background border-b px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Menu Toggle for Mobile -->
          <Button 
            variant="ghost" 
            size="sm" 
            @click="toggleSidebar" 
            class="md:hidden"
          >
            <Menu class="h-5 w-5" />
          </Button>
          
          <!-- App Logo -->
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Clock class="h-4 w-4 text-primary-foreground" />
            </div>
            <span class="font-semibold text-lg">TICKTRAX</span>
          </div>
        </div>
        
        <!-- Header Actions -->
        <div class="flex items-center gap-2">
          <!-- Notifications -->
          <Button variant="ghost" size="sm" class="relative">
            <Bell class="h-5 w-5" />
            <Badge 
              v-if="internalNotifications > 0" 
              class="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs"
            >
              {{ internalNotifications }}
            </Badge>
          </Button>
          
          <!-- Theme Toggle -->
          <ThemeToggle />
          
          <!-- Profile Menu -->
          <Button variant="ghost" size="sm" @click="$emit('profileClick')">
            <User class="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>

    <!-- Temporary debug button: always visible on mobile to force-open the sidebar -->
    <Button
      variant="secondary"
      size="sm"
      class="fixed bottom-6 right-4 z-60 md:hidden"
      @click="sidebarOpen = true"
      title="Open menu (debug)"
    >
      Menu (DBG)
    </Button>

    <!-- Mobile Sidebar Overlay -->
       <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 md:hidden"
      role="button"
      aria-label="Close menu"
      tabindex="0"
      @click="closeSidebar('overlay')"
      @pointerdown="closeSidebar('overlay')"
      @touchstart.prevent="closeSidebar('overlay')"
    ></div>

    <!-- Sidebar Panel -->
    <aside
      v-if="sidebarOpen"
      :style="asideStyle"
      class="fixed left-0 top-0 bottom-0 z-50 w-72 bg-background md:hidden overflow-auto"
      @click.stop
    >
      <!-- Sidebar Header -->
      <div class="p-4 border-b">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <component :is="currentConfig.icon" class="h-6 w-6 text-primary" />
            <span class="font-semibold">{{ currentConfig.title }}</span>
          </div>
          <Button variant="ghost" size="sm" @click="closeSidebar('header')">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <!-- Navigation Menu -->
      <ScrollArea class="flex-1 p-4">
        <nav class="space-y-2">
          <Button
            v-for="item in currentConfig.menuItems"
            :key="item.id"
            :variant="currentView === item.id ? 'default' : 'ghost'"
            class="w-full justify-start gap-3 h-12"
            @click="handleNavigation(item.id)"
          >
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </Button>
        </nav>
      </ScrollArea>
      
      <!-- Sidebar Footer -->
      <div class="p-4 border-t">
        <div class="space-y-2">
          <div class="text-sm text-muted-foreground">
            Logged in as: {{ userName }}
          </div>
          <Button 
            variant="outline" 
            class="w-full gap-2" 
            @click="$emit('logout')"
          >
            <LogOut class="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="mobile-main flex-1 pb-16 md:pb-4">
      <div class="container max-w-full px-4 py-4">
        <slot />
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t md:hidden safe-area-inset-bottom">
      <div class="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        <Button
          v-for="item in quickNavItems"
          :key="item.id"
          :variant="currentView === item.id ? 'secondary' : 'ghost'"
          size="sm"
          class="flex-col gap-1 h-14 min-w-0 flex-1 rounded-lg transition-all duration-200"
          :class="{
            'scale-105 shadow-md': currentView === item.id,
            'opacity-70': item.priority === 'low' && currentView !== item.id,
            'border-l-2': currentView === item.id,
            [`border-l-${currentConfig.color}-500`]: currentView === item.id
          }"
          @click="handleNavigation(item.id)"
        >
          <component :is="item.icon" class="h-4 w-4" :class="currentView === item.id ? `text-${currentConfig.color}-600` : ''" />
          <span class="text-xs truncate font-medium">{{ item.shortLabel || item.label }}</span>
        </Button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
/* Mobile-specific enhancements */
.mobile-bottom-nav {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

/* Safe area handling for mobile devices */
.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Role-based color utilities */
.border-l-blue-500 {
  border-left-color: hsl(var(--blue));
}

.border-l-green-500 {
  border-left-color: hsl(var(--green));
}

.border-l-purple-500 {
  border-left-color: hsl(var(--purple));
}

.border-l-red-500 {
  border-left-color: hsl(var(--red));
}

.text-blue-600 {
  color: hsl(var(--blue));
}

.text-green-600 {
  color: hsl(var(--green));
}

.text-purple-600 {
  color: hsl(var(--purple));
}

.text-red-600 {
  color: hsl(var(--red));
}

/* Mobile sidebar animations */
.sidebar-transition {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Priority-based styling */
.priority-high {
  font-weight: 600;
}

.priority-medium {
  font-weight: 500;
}

.priority-low {
  font-weight: 400;
  opacity: 0.8;
}

/* Mobile-specific button enhancements */
.mobile-nav-button {
  min-height: 56px; /* Touch-friendly minimum */
  touch-action: manipulation;
}

/* Backdrop blur support */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Enhanced mobile header */
.mobile-header {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.9);
}

.dark .mobile-header {
  background: rgba(0, 0, 0, 0.9);
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { watch } from 'vue';
import { 
  Clock, Users, FileText, Settings, Home, Calendar, TrendingUp, 
  Shield, Bell, HelpCircle, LogOut, User, Menu, X 
} from 'lucide-vue-next';
import ThemeToggle from '../ThemeToggle.vue';
import realTimeService from '../../services/realTimeService.js';
import authManager from '../../services/authService.js';
import { onUnmounted } from 'vue';
import Badge from '../ui/badge.vue';
import Button from '../ui/button.vue';
import ScrollArea from '../ui/scroll-area.vue';

const props = defineProps({
  currentRole: String,
  userName: String,
  notifications: { type: Number, default: 0 },
  currentView: String
});

const emit = defineEmits(['update:currentView', 'logout', 'profileClick']);

const sidebarOpen = ref(false);
const internalNotifications = ref(props.notifications || 0);

// Subscribe to real-time notifications for the current user when mounted
const setupNotifications = async () => {
  try {
    // Only setup notifications if user is authenticated
    if (!authManager.isAuthenticated()) {
      console.debug('User not authenticated, skipping real-time notifications setup');
      return;
    }

    const profile = await authManager.getUserProfile();
    const uid = profile?.id || profile?.user_id || null;
    if (!uid) {
      console.debug('No user ID available, skipping real-time notifications setup');
      return;
    }
    
    // Join notifications channel (no-op if server not available)
    try {
      await realTimeService.joinNotifications(uid);
      realTimeService.on('notification', (data) => {
        internalNotifications.value = (internalNotifications.value || 0) + 1;
      });
      realTimeService.on('alert', (data) => {
        internalNotifications.value = (internalNotifications.value || 0) + 1;
      });
    } catch (e) {
      console.debug('realTimeService joinNotifications failed:', e);
    }
  } catch (e) {
    console.warn('setupNotifications error', e);
  }
};

onMounted(() => {
  setupNotifications();
});

onUnmounted(() => {
  try { realTimeService.off('notification'); realTimeService.off('alert'); } catch(e){}
});

const roleConfig = {
  employee: {
    title: "Employee Portal",
    icon: Clock,
    color: "blue",
    menuItems: [
      { icon: Home, label: "Dashboard", id: "dashboard", shortLabel: "Home", priority: "high" },
      { icon: Clock, label: "Clock In/Out", id: "clock", shortLabel: "Clock", priority: "high" },
      { icon: FileText, label: "Time Management", id: "timesheet", shortLabel: "Time", priority: "medium" },
      { icon: Calendar, label: "My Schedule", id: "schedule", shortLabel: "Schedule", priority: "medium" },
      { icon: TrendingUp, label: "My Reports", id: "reports", shortLabel: "Reports", priority: "low" },
      { icon: HelpCircle, label: "Help Center", id: "help", shortLabel: "Help", priority: "low" },
    ],
  },
  manager: {
    title: "Manager Portal",
    icon: Users,
    color: "green",
    menuItems: [
      { icon: Home, label: "Dashboard", id: "dashboard", shortLabel: "Home", priority: "high" },
      { icon: Users, label: "Team Overview", id: "team", shortLabel: "Team", priority: "high" },
      { icon: FileText, label: "Approvals", id: "approvals", shortLabel: "Approvals", priority: "high" },
      { icon: TrendingUp, label: "Reports", id: "reports", shortLabel: "Reports", priority: "medium" },
      { icon: Bell, label: "Alerts", id: "alerts", shortLabel: "Alerts", priority: "medium" },
      { icon: HelpCircle, label: "Help Center", id: "help", shortLabel: "Help", priority: "low" },
    ],
  },
  hr: {
    title: "HR Portal",
    icon: Users,
    color: "purple",
    menuItems: [
      { icon: Home, label: "Dashboard", id: "dashboard", shortLabel: "Home", priority: "high" },
      { icon: Users, label: "Employee Management", id: "employees", shortLabel: "Staff", priority: "high" },
      { icon: FileText, label: "Recruitment", id: "recruitment", shortLabel: "Hire", priority: "high" },
      { icon: TrendingUp, label: "Performance", id: "performance", shortLabel: "Perf", priority: "medium" },
      { icon: Calendar, label: "Payroll", id: "payroll", shortLabel: "Pay", priority: "medium" },
      { icon: Shield, label: "HR Reports", id: "reports", shortLabel: "Reports", priority: "medium" },
      { icon: Settings, label: "HR Settings", id: "settings", shortLabel: "Settings", priority: "low" },
      { icon: HelpCircle, label: "Help Center", id: "help", shortLabel: "Help", priority: "low" },
    ],
  },
  admin: {
    title: "Admin Portal",
    icon: Shield,
    color: "red",
    menuItems: [
      { icon: Home, label: "Dashboard", id: "dashboard", shortLabel: "Home", priority: "high" },
      { icon: Users, label: "Employee Management", id: "employees", shortLabel: "Staff", priority: "high" },
      { icon: TrendingUp, label: "Analytics", id: "analytics", shortLabel: "Analytics", priority: "high" },
      { icon: Settings, label: "Settings", id: "settings", shortLabel: "Settings", priority: "high" },
      { icon: Clock, label: "Kiosk Mode", id: "kiosk", shortLabel: "Kiosk", priority: "medium" },
      { icon: FileText, label: "Reports", id: "reports", shortLabel: "Reports", priority: "medium" },
      { icon: HelpCircle, label: "Help Center", id: "help", shortLabel: "Help", priority: "low" },
    ],
  },
};

const currentConfig = computed(() => roleConfig[props.currentRole] || roleConfig.employee);

watch(() => props.notifications, (v) => {
  internalNotifications.value = v || 0;
});

// Quick navigation items for bottom nav (prioritized, max 5 items)
const quickNavItems = computed(() => {
  const items = currentConfig.value.menuItems;
  
  // Prioritize high priority items first, then medium, then low
  const highPriority = items.filter(item => item.priority === 'high');
  const mediumPriority = items.filter(item => item.priority === 'medium');
  const lowPriority = items.filter(item => item.priority === 'low');
  
  // Take up to 5 items, prioritizing high priority items
  let result = [...highPriority];
  
  if (result.length < 5) {
    result = [...result, ...mediumPriority.slice(0, 5 - result.length)];
  }
  
  if (result.length < 5) {
    result = [...result, ...lowPriority.slice(0, 5 - result.length)];
  }
  
  return result.slice(0, 5);
});

const toggleSidebar = () => {
  // debug: log when toggle is called and the resulting state
  sidebarOpen.value = !sidebarOpen.value;
  console.debug('[MobileLayout] toggleSidebar called, sidebarOpen =', sidebarOpen.value);
};

const closeSidebar = (source = 'unknown') => {
  // debug: log when sidebar is closed and where the action originated
  sidebarOpen.value = false;
  console.debug('[MobileLayout] closeSidebar called, source =', source, 'sidebarOpen =', sidebarOpen.value);
};

onMounted(() => {
  // Build marker — helps verify the running WebView is using this exact source version
  console.info('[MobileLayout] mounted - buildMarker=mobile-layout-v2');
});

// Visual debug style for the aside to surface z-index/transform issues.
const asideStyle = computed(() => {
  if (!sidebarOpen.value) return {};
  return {
    transform: 'translateX(0) !important',
    outline: '3px solid rgba(220, 38, 38, 0.9)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    zIndex: '99999'
  };
});

const handleNavigation = (viewId) => {
  emit('update:currentView', viewId);
  closeSidebar('nav');
};
</script>

<style scoped>
.mobile-app {
  /* Ensure full height on mobile */
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
}

.mobile-header {
  /* Safe area for notched devices */
  padding-top: max(12px, env(safe-area-inset-top));
}

.mobile-main {
  /* Account for header and bottom nav */
  padding-top: 0;
  padding-bottom: calc(64px + env(safe-area-inset-bottom));
}

.mobile-bottom-nav {
  /* Safe area for home indicator */
  padding-bottom: env(safe-area-inset-bottom);
}

/* Touch-friendly button sizes */
@media (max-width: 768px) {
  .mobile-bottom-nav button {
    min-height: 48px;
    min-width: 48px;
  }
}

/* Smooth transitions */
.mobile-app * {
  -webkit-tap-highlight-color: transparent;
}
</style>
