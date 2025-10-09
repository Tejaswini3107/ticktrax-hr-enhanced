<template>
  <div class="mobile-app-wrapper">
    <!-- Mobile Layout - Direct Real-time Interface -->
    <div class="mobile-view">
      <!-- Mobile Real-time Dashboard -->
      <div class="bg-gradient-to-br from-blue-600 to-purple-600 text-white min-h-screen">
        <!-- Header -->
        <div class="p-4 pb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold">TickTrax Real-time</h1>
              <p class="text-blue-100 text-sm">Live time tracking</p>
            </div>
            <div class="flex items-center space-x-2">
              <div :class="isConnected ? 'bg-green-400' : 'bg-red-400'" class="w-2 h-2 rounded-full"></div>
              <span class="text-xs text-blue-100">{{ isConnected ? 'Live' : 'Offline' }}</span>
            </div>
          </div>
        </div>

        <!-- Real-time Clock Widget -->
        <div class="px-4 mb-6">
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div class="text-4xl font-mono font-bold mb-2">{{ currentTime }}</div>
            <p class="text-blue-100 text-sm">Real-time clock</p>
            
            <!-- Clock Actions -->
            <div class="grid grid-cols-2 gap-3 mt-6">
              <button 
                @click="handleClockAction('in')"
                class="px-4 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors"
              >
                🕐 Clock In
              </button>
              <button 
                @click="handleClockAction('out')"
                class="px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
              >
                🕐 Clock Out
              </button>
            </div>
          </div>
        </div>

        <!-- Real-time Stats -->
        <div class="px-4 mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
              <div class="text-2xl font-bold">{{ hoursToday }}</div>
              <div class="text-blue-100 text-sm">Hours Today</div>
            </div>
            <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
              <div class="text-2xl font-bold">{{ status }}</div>
              <div class="text-blue-100 text-sm">Status</div>
            </div>
          </div>
        </div>

        <!-- Real-time Features -->
        <div class="px-4">
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4">Live Features</h3>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">WebSocket Connection</span>
                <span class="text-green-300 text-xs">✓ Active</span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Real-time Updates</span>
                <span class="text-green-300 text-xs">✓ Enabled</span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Live Notifications</span>
                <span class="text-blue-300 text-xs">{{ notificationCount }} received</span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Sync Status</span>
                <span class="text-yellow-300 text-xs">{{ lastSyncTime }}</span>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="mt-6 space-y-2">
              <button 
                @click="triggerSync"
                class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors"
              >
                🔄 Sync Data
              </button>
              
              <button 
                @click="sendTestNotification"
                class="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium transition-colors"
              >
                📢 Test Notification
              </button>
              
              <button 
                @click="toggleConnection"
                class="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                {{ isConnected ? '🔌 Disconnect' : '🔌 Connect' }}
              </button>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue-sonner';

// Real-time state
const isConnected = ref(true);
const currentTime = ref(new Date().toLocaleTimeString());
const hoursToday = ref('7.5h');
const status = ref('Active');
const notificationCount = ref(3);
const lastSyncTime = ref('Just now');

// Real-time functions
const handleClockAction = (action) => {
  if (action === 'in') {
    toast.success('🕐 Clocked in successfully!');
    status.value = 'Working';
  } else {
    toast.success('🕐 Clocked out successfully!');
    status.value = 'Break';
  }
};

const triggerSync = () => {
  lastSyncTime.value = new Date().toLocaleTimeString();
  notificationCount.value += 1;
  toast.info('🔄 Data synchronized!');
};

const sendTestNotification = () => {
  notificationCount.value += 1;
  toast.warning('📢 Test notification sent!');
};

const toggleConnection = () => {
  isConnected.value = !isConnected.value;
  toast[isConnected.value ? 'success' : 'error'](
    isConnected.value ? '🔌 Connected to real-time services' : '🔌 Disconnected'
  );
};

// Update clock every second
onMounted(() => {
  setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString();
  }, 1000);
  
  toast.success('📱 Real-time mobile app loaded!');
});
</script>

<style scoped>
.mobile-app-wrapper {
  min-height: 100vh;
}

.mobile-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
    // update lastSet so future attempts are measured from now
    lastSet.value = { view, at: now };
    return;
  }

  // If the dashboard is being set programmatically (not user-intent), trace the call origin
  if (view === 'dashboard' && currentView.value && currentView.value !== 'dashboard') {
    console.debug('[MobileAppWrapper] dashboard set programmatically? prev=', currentView.value, 'now=', now, 'lastSet=', lastSet.value);
    const err = new Error('[MobileAppWrapper] dashboard set - stack');
    console.error('[MobileAppWrapper] dashboard set programmatically. Stack below:');
    console.error(err.stack);
    // Also emit a console.trace for richer information in Chromium logcat
    try {
      console.trace();
    } catch (traceErr) {
      // ignore if console.trace is not available
    }
    // Expose the stack on window so it can be inspected from DevTools or other runtime probes
    if (typeof window !== 'undefined') {
      try {
        window.__lastDashboardStack = err.stack;
      } catch (werr) {
        // ignore write errors
      }
    }
    // Also persist to localStorage (so we can read it later if console gets noisy)
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('__lastDashboardStack', err.stack || '[no-stack]');
        // Print a short slice so logcat shows the most relevant top frames
        const stackLines = (err.stack || '').split('\n');
        console.error('[MobileAppWrapper] stack-snippet:', stackLines.slice(0,6).join(' | '));
        // Print top lines individually for clearer visibility in logcat
        stackLines.slice(0,8).forEach((ln, idx) => {
          console.error(`[MobileAppWrapper] stack-line[${idx}] ${ln}`);
        });
        try {
          localStorage.setItem('__lastDashboardStackLines', JSON.stringify(stackLines.slice(0,20)));
        } catch (sErr) {
          // ignore
        }
      }
    } catch (lsErr) {
      // ignore storage errors
    }
  }

  // Accept the navigation
  currentView.value = view;
  lastSet.value = { view, at: now };
};

// Temporary global helper to force logout from a console or external script.
if (typeof window !== 'undefined') {
  // attach on window so you can call `window.forceLogout()` from DevTools
  window.forceLogout = async () => {
    try {
      await handleLogout();
      console.log('forceLogout: logout invoked');
    } catch (e) {
      console.error('forceLogout error', e);
    }
  };
}

const handleClockIn = async () => {
  try {
    clockedIn.value = true;
    clockInTime.value = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    toast.success('Clocked in successfully');
  } catch (error) {
    toast.error('Failed to clock in');
  }
};

const handleClockOut = async () => {
  try {
    clockedIn.value = false;
    clockInTime.value = '';
    toast.success('Clocked out successfully');
  } catch (error) {
    toast.error('Failed to clock out');
  }
};

const installPWA = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
    }
    
    deferredPrompt.value = null;
    showInstallPrompt.value = false;
  }
};

const dismissInstallPrompt = () => {
  showInstallPrompt.value = false;
  localStorage.setItem('pwa-install-dismissed', Date.now().toString());
};

const getViewTitle = (view) => {
  const titles = {
    dashboard: 'Dashboard',
    clock: 'Time Clock',
    timesheet: 'Timesheet',
    schedule: 'Schedule',
    reports: 'Reports',
    team: 'Team',
    employees: 'Employees',
    settings: 'Settings',
    help: 'Help Center'
  };
  return titles[view] || view.charAt(0).toUpperCase() + view.slice(1);
};
</script>

<style scoped>
.mobile-app-wrapper {
  min-height: 100vh;
  min-height: 100dvh;
}

.mobile-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.mobile-dashboard {
  padding: 1rem;
}

.mobile-view-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Smooth transitions */
.mobile-app-wrapper * {
  -webkit-tap-highlight-color: transparent;
}

/* Hide scrollbars on mobile for cleaner look */
@media (max-width: 768px) {
  ::-webkit-scrollbar {
    display: none;
  }
  
  * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
</style>
