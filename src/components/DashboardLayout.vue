<script setup>
import { computed, ref } from 'vue';
import { Clock, Users, FileText, Settings, Home, Calendar, TrendingUp, Shield, Bell, HelpCircle, LogOut, User, Menu, X } from 'lucide-vue-next';
import ThemeToggle from './ThemeToggle.vue';
import Badge from './ui/badge.vue';
import Button from './ui/button.vue';
import ScrollArea from './ui/scroll-area.vue';

// Role types removed - using JavaScript

const props = defineProps({
  currentRole: String,
  userName: String,
  notifications: Number,
  currentView: String
});

const emit = defineEmits(['update:currentRole', 'update:currentView', 'logout', 'profileClick']);

const roleConfig = {
  employee: {
    title: "Employee Portal",
    icon: Clock,
    color: "blue",
    menuItems: [
      { icon: Home, label: "Dashboard", id: "dashboard", priority: "high" },
      { icon: Clock, label: "Clock In/Out", id: "clock", priority: "high" },
      { icon: FileText, label: "Time Management", id: "timesheet", priority: "medium" },
      { icon: Calendar, label: "My Schedule", id: "schedule", priority: "medium" },
      { icon: TrendingUp, label: "My Reports", id: "reports", priority: "low" },
      { icon: HelpCircle, label: "Help Center", id: "help", priority: "low" },
    ],
  },
  manager: {
    title: "Manager Portal",
    icon: Users,
    color: "green",
    menuItems: [
      { icon: Home, label: "Dashboard", id: "dashboard", priority: "high" },
      { icon: Users, label: "Team Overview", id: "team", priority: "high" },
      { icon: FileText, label: "Approvals", id: "approvals", priority: "high" },
      { icon: TrendingUp, label: "Reports", id: "reports", priority: "medium" },
      { icon: Bell, label: "Alerts", id: "alerts", priority: "medium" },
      { icon: HelpCircle, label: "Help Center", id: "help", priority: "low" },
    ],
  },
  hr: {
    title: "HR Portal",
    icon: Users,
    color: "purple",
    menuItems: [
      { icon: Home, label: "Dashboard", id: "dashboard", priority: "high" },
      { icon: Users, label: "Employee Management", id: "employees", priority: "high" },
      { icon: FileText, label: "Approvals", id: "approvals", priority: "high" },
      { icon: TrendingUp, label: "HR Reports", id: "reports", priority: "medium" },
      { icon: Settings, label: "HR Settings", id: "settings", priority: "low" },
      { icon: HelpCircle, label: "Help Center", id: "help", priority: "low" },
    ],
  },
  admin: {
    title: "Admin Portal",
    icon: Shield,
    color: "red",
    menuItems: [
      { icon: Home, label: "Dashboard", id: "dashboard", priority: "high" },
      { icon: Users, label: "Employee Management", id: "employees", priority: "high" },
      { icon: TrendingUp, label: "System Reports", id: "reports", priority: "high" },
      { icon: Settings, label: "System Settings", id: "settings", priority: "high" },
      { icon: Clock, label: "Kiosk Mode", id: "kiosk", priority: "medium" },
      { icon: FileText, label: "Audit Logs", id: "audit", priority: "medium" },
      { icon: HelpCircle, label: "Help Center", id: "help", priority: "low" },
    ],
  },
};

const normalizedRole = computed(() => (props.currentRole || 'employee').toString().toLowerCase());
const config = computed(() => roleConfig[normalizedRole.value] || roleConfig.employee);
const Icon = computed(() => (config.value && config.value.icon) ? config.value.icon : Clock);

// Mobile sidebar state
const mobileSidebarOpen = ref(false);

// Menu items organized by priority
const highPriorityItems = computed(() => 
  config.value.menuItems.filter(item => item.priority === 'high')
);

const mediumPriorityItems = computed(() => 
  config.value.menuItems.filter(item => item.priority === 'medium')
);

const lowPriorityItems = computed(() => 
  config.value.menuItems.filter(item => item.priority === 'low')
);

// Mobile menu selection handler
const selectMobileMenuItem = (itemId) => {
  // Mobile menu item selected
  mobileSidebarOpen.value = false;
  emit('update:currentView', itemId);
};

// Desktop menu selection handler
const selectMenuItem = (itemId) => {
  // Menu item selected
  emit('update:currentView', itemId);
};
</script>

<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:flex w-64 border-r border-border bg-card flex-col shrink-0 sidebar-gradient" :class="`sidebar-${config.color}`">
      <div class="p-6 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg">
            <component :is="Icon" class="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-foreground">TickTrax</h2>
            <p class="text-xs text-muted-foreground">{{ config.title }}</p>
          </div>
        </div>
      </div>

      <ScrollArea class="flex-1 px-3 py-4">
        <nav class="space-y-2">
          <!-- High Priority Items -->
          <div v-if="highPriorityItems.length > 0" class="space-y-1">
            <div class="text-xs font-medium text-muted-foreground px-3 py-2">Essential</div>
            <Button
              v-for="item in highPriorityItems"
              :key="item.id"
              :variant="currentView === item.id ? 'secondary' : 'ghost'"
              class="w-full justify-start gap-3 h-11"
              @click="selectMenuItem(item.id)"
            >
              <component :is="item.icon" class="h-5 w-5" />
              {{ item.label }}
            </Button>
          </div>

          <!-- Medium Priority Items -->
          <div v-if="mediumPriorityItems.length > 0" class="space-y-1 mt-4">
            <div class="text-xs font-medium text-muted-foreground px-3 py-2">Tools</div>
            <Button
              v-for="item in mediumPriorityItems"
              :key="item.id"
              :variant="currentView === item.id ? 'secondary' : 'ghost'"
              class="w-full justify-start gap-3 h-11"
              @click="selectMenuItem(item.id)"
            >
              <component :is="item.icon" class="h-5 w-5" />
              {{ item.label }}
            </Button>
          </div>

          <!-- Low Priority Items -->
          <div v-if="lowPriorityItems.length > 0" class="space-y-1 mt-4">
            <div class="text-xs font-medium text-muted-foreground px-3 py-2">Support</div>
            <Button
              v-for="item in lowPriorityItems"
              :key="item.id"
              :variant="currentView === item.id ? 'secondary' : 'ghost'"
              class="w-full justify-start gap-3 h-11"
              @click="selectMenuItem(item.id)"
            >
              <component :is="item.icon" class="h-5 w-5" />
              {{ item.label }}
            </Button>
          </div>
        </nav>
      </ScrollArea>

      <!-- Role Badge -->
      <div class="p-4 border-t border-border">
        <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
          <div class="w-2 h-2 rounded-full" :class="`bg-${config.color}-500`"></div>
          <span class="text-xs font-medium capitalize">{{ normalizedRole }}</span>
        </div>
      </div>
    </aside>

    <!-- Mobile Sidebar Overlay -->
    <div v-if="mobileSidebarOpen" class="lg:hidden fixed inset-0 z-50 bg-black/50" @click="mobileSidebarOpen = false">
      <aside class="fixed left-0 top-0 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out" :class="mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'">
        <div class="p-4 border-b border-border">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <component :is="Icon" class="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h2 class="text-sm font-semibold">TickTrax</h2>
                <p class="text-xs text-muted-foreground">{{ config.title }}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" @click="mobileSidebarOpen = false">
              <X class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea class="flex-1 px-3 py-4">
          <nav class="space-y-2">
            <Button
              v-for="item in config.menuItems"
              :key="item.id"
              :variant="currentView === item.id ? 'secondary' : 'ghost'"
              class="w-full justify-start gap-3 h-11"
              @click="selectMobileMenuItem(item.id)"
            >
              <component :is="item.icon" class="h-5 w-5" />
              {{ item.label }}
            </Button>
          </nav>
        </ScrollArea>
      </aside>
    </div>

    <div class="flex-1 flex flex-col min-h-0">
      <!-- Mobile Header -->
      <header class="lg:hidden border-b border-border bg-card px-4 py-3 shrink-0">
        <div class="flex items-center justify-between">
          <Button variant="ghost" size="sm" @click="mobileSidebarOpen = true">
            <Menu class="h-5 w-5" />
          </Button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <component :is="Icon" class="h-4 w-4 text-primary-foreground" />
            </div>
            <span class="font-semibold">TickTrax</span>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="sm" @click="$emit('profileClick')">
              <User class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <!-- Desktop Header -->
      <header class="hidden lg:flex border-b border-border bg-card px-6 py-4 shrink-0">
        <div class="flex items-center justify-between w-full">
          <div>
            <h1 class="text-2xl font-bold">{{ config.title }}</h1>
            <p class="text-sm text-muted-foreground mt-1">Welcome back, {{ userName }}</p>
          </div>
          <div class="flex items-center gap-3">
            <Button variant="ghost" size="icon" class="relative">
              <Bell class="h-5 w-5" />
              <Badge v-if="notifications > 0" variant="destructive" class="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {{ notifications }}
              </Badge>
            </Button>
            <Button variant="ghost" size="icon" @click="$emit('profileClick')">
              <User class="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button variant="outline" size="sm" @click="$emit('logout')" class="gap-2">
              <LogOut class="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto overflow-x-hidden">
        <div class="p-4 lg:p-6 min-h-full">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Role-based sidebar gradients */
.sidebar-gradient {
  background: linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%);
}

.sidebar-blue {
  border-left: 4px solid hsl(var(--blue));
}

.sidebar-green {
  border-left: 4px solid hsl(var(--green));
}

.sidebar-purple {
  border-left: 4px solid hsl(var(--purple));
}

.sidebar-red {
  border-left: 4px solid hsl(var(--red));
}

/* Mobile sidebar animations */
.mobile-sidebar-enter-active,
.mobile-sidebar-leave-active {
  transition: transform 0.3s ease-in-out;
}

.mobile-sidebar-enter-from,
.mobile-sidebar-leave-to {
  transform: translateX(-100%);
}

/* Priority-based menu styling */
.nav-item-high {
  @apply font-semibold;
}

.nav-item-medium {
  @apply font-medium;
}

.nav-item-low {
  @apply font-normal opacity-80;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .sidebar-desktop {
    display: none;
  }
}

@media (min-width: 1024px) {
  .mobile-sidebar {
    display: none;
  }
}

/* Role color utilities */
.bg-blue-500 {
  background-color: hsl(var(--blue));
}

.bg-green-500 {
  background-color: hsl(var(--green));
}

.bg-purple-500 {
  background-color: hsl(var(--purple));
}

.bg-red-500 {
  background-color: hsl(var(--red));
}
</style>
