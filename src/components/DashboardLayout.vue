<script setup>
import { computed } from 'vue';
import { Clock, Users, FileText, Settings, Home, Calendar, TrendingUp, Shield, Bell, HelpCircle, LogOut, User } from 'lucide-vue-next';
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
    menuItems: [
      { icon: Home, label: "Dashboard", id: "dashboard" },
      { icon: Clock, label: "Clock In/Out", id: "clock" },
      { icon: FileText, label: "Time Management", id: "timesheet" },
      { icon: Calendar, label: "My Schedule", id: "schedule" },
      { icon: TrendingUp, label: "My Reports", id: "reports" },
      { icon: HelpCircle, label: "Help Center", id: "help" },
    ],
  },
  manager: {
    title: "Manager Portal",
    icon: Users,
    menuItems: [
      { icon: Home, label: "Dashboard", id: "dashboard" },
      { icon: Users, label: "Team Overview", id: "team" },
      { icon: FileText, label: "Approvals", id: "approvals" },
      { icon: TrendingUp, label: "Reports", id: "reports" },
      { icon: Bell, label: "Alerts", id: "alerts" },
      { icon: HelpCircle, label: "Help Center", id: "help" },
    ],
  },
  admin: {
    title: "Admin Portal",
    icon: Shield,
    menuItems: [
      { icon: Home, label: "Dashboard", id: "dashboard" },
      { icon: Users, label: "Employee Management", id: "employees" },
      { icon: TrendingUp, label: "Workforce Analytics", id: "analytics" },
      { icon: Settings, label: "System Settings", id: "settings" },
      { icon: Clock, label: "Kiosk Mode", id: "kiosk" },
      { icon: FileText, label: "Reports", id: "reports" },
      { icon: HelpCircle, label: "Help Center", id: "help" },
    ],
  },
};

const config = computed(() => roleConfig[props.currentRole]);
const Icon = computed(() => config.value.icon);
</script>

<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <aside class="w-64 border-r border-border bg-card flex flex-col shrink-0">
      <div class="p-6 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <component :is="Icon" class="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 class="text-sm text-muted-foreground">TimeTrack Pro</h2>
          </div>
        </div>
      </div>

      <ScrollArea class="flex-1 px-3 py-4">
        <nav class="space-y-1">
          <Button
            v-for="item in config.menuItems"
            :key="item.id"
            :variant="currentView === item.id ? 'secondary' : 'ghost'"
            class="w-full justify-start gap-3"
            @click="$emit('update:currentView', item.id)"
          >
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </Button>
        </nav>
      </ScrollArea>

      <!-- <div class="p-4 border-t border-border space-y-2">
        <div class="text-xs text-muted-foreground px-3">Switch Role</div>
        <div class="grid grid-cols-2 gap-2">
          <Button
            v-for="role in ['employee', 'manager', 'admin']"
            :key="role"
            :variant="currentRole === role ? 'default' : 'outline'"
            size="sm"
            @click="$emit('update:currentRole', role)"
            class="capitalize text-xs"
          >
            {{ role }}
          </Button>
        </div> -->
      <!-- </div> -->
    </aside>

    <div class="flex-1 flex flex-col min-h-0">
      <header class="border-b border-border bg-card px-6 py-4 shrink-0">
        <div class="flex items-center justify-between">
          <div>
            <h1>{{ config.title }}</h1>
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
        <div class="p-6 min-h-full">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>
