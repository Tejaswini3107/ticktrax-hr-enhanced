<template>
  <div class="mobile-clock-widget space-y-6">
    <!-- Status Card -->
    <Card class="shadow-lg border-0">
      <CardContent class="p-6">
        <div class="text-center space-y-4">
          <!-- Current Time Display -->
          <div class="space-y-2">
            <div class="text-4xl font-mono font-bold tracking-wider">
              {{ currentTime }}
            </div>
            <div class="text-sm text-muted-foreground">
              {{ currentDate }}
            </div>
          </div>

          <!-- Status Indicator -->
          <div class="flex items-center justify-center gap-3">
            <div :class="[
              'w-3 h-3 rounded-full',
              clockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            ]" />
            <span class="font-medium">
              {{ clockedIn ? 'Clocked In' : 'Clocked Out' }}
            </span>
          </div>

          <!-- Work Session Info -->
          <div v-if="clockedIn" class="bg-muted/50 rounded-lg p-4 space-y-2">
            <div class="text-sm text-muted-foreground">Today's Work Time</div>
            <div class="text-2xl font-mono font-semibold">
              {{ workTimeToday }}
            </div>
            <div class="text-xs text-muted-foreground">
              Started at {{ clockInTime }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Action Buttons -->
    <div class="space-y-3">
      <!-- Primary Clock Action -->
      <Button
        :class="[
          'w-full h-16 text-lg font-semibold rounded-xl shadow-lg',
          clockedIn 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        ]"
        @click="toggleClock"
        :disabled="isLoading"
      >
        <div class="flex items-center justify-center gap-3">
          <Loader2 v-if="isLoading" class="h-6 w-6 animate-spin" />
          <component v-else :is="clockedIn ? Square : Play" class="h-6 w-6" />
          <span>{{ clockedIn ? 'Clock Out' : 'Clock In' }}</span>
        </div>
      </Button>

      <!-- Secondary Actions -->
      <div class="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          class="h-12 gap-2"
          @click="$emit('show-break-dialog')"
          :disabled="!clockedIn"
        >
          <Coffee class="h-4 w-4" />
          Break
        </Button>
        
        <Button
          variant="outline"
          class="h-12 gap-2"
          @click="$emit('show-timesheet')"
        >
          <FileText class="h-4 w-4" />
          Timesheet
        </Button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 gap-4">
      <Card>
        <CardContent class="p-4 text-center">
          <div class="text-2xl font-bold text-primary">{{ weeklyHours }}</div>
          <div class="text-sm text-muted-foreground">This Week</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4 text-center">
          <div class="text-2xl font-bold text-primary">{{ monthlyHours }}</div>
          <div class="text-sm text-muted-foreground">This Month</div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Activity -->
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2 mb-4">
          <History class="h-4 w-4 text-muted-foreground" />
          <span class="font-medium">Recent Activity</span>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="activity in recentActivity" 
            :key="activity.id"
            class="flex items-center justify-between py-2 border-b last:border-b-0"
          >
            <div class="flex items-center gap-3">
              <div :class="[
                'w-2 h-2 rounded-full',
                activity.type === 'in' ? 'bg-green-500' : 'bg-red-500'
              ]" />
              <div>
                <div class="text-sm font-medium">
                  {{ activity.type === 'in' ? 'Clocked In' : 'Clocked Out' }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ activity.date }}
                </div>
              </div>
            </div>
            <div class="text-sm font-mono">
              {{ activity.time }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Location Info (if GPS enabled) -->
    <Card v-if="locationEnabled">
      <CardContent class="p-4">
        <div class="flex items-center gap-2 mb-2">
          <MapPin class="h-4 w-4 text-muted-foreground" />
          <span class="font-medium">Location</span>
          <Badge v-if="locationVerified" variant="success" class="text-xs">
            Verified
          </Badge>
        </div>
        <div class="text-sm text-muted-foreground">
          {{ currentLocation || 'Getting location...' }}
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import Badge from '../ui/badge.vue';
import { 
  Clock, Play, Square, Coffee, FileText, History, 
  MapPin, Loader2 
} from 'lucide-vue-next';
import apiService from '../../services/apiService.js';
import authManager from '../../services/authService.js';
import { toast } from 'vue-sonner';

const props = defineProps({
  clockedIn: { type: Boolean, default: false },
  clockInTime: String,
  workTimeToday: { type: String, default: '0:00' },
  weeklyHours: { type: String, default: '0h' },
  monthlyHours: { type: String, default: '0h' },
  locationEnabled: { type: Boolean, default: false }
});

const emit = defineEmits([
  'clock-in', 
  'clock-out', 
  'show-break-dialog', 
  'show-timesheet'
]);

const currentTime = ref('');
const currentDate = ref('');
const isLoading = ref(false);
const currentLocation = ref('');
const locationVerified = ref(false);

const recentActivity = ref([]);

const loadRecentActivity = async () => {
  try {
    const cur = await authManager.getCurrentUser();
    const uid = cur?.data?.id || cur?.data?.attributes?.id || null;
    if (!uid) return;
    const rows = await apiService.getUserClock(uid);
    const arr = Array.isArray(rows) ? rows : (rows?.data || []);
    recentActivity.value = arr.slice(-10).reverse().map(r => {
      // r may have fields like id, type, timestamp/start_time
      const ts = r.timestamp || r.created_at || r.time || r.start_time || '';
      const d = ts ? new Date(ts) : null;
      return {
        id: r.id || r._id || Math.random().toString(36).slice(2,9),
        type: (r.type || r.action || (r.status === 'in' ? 'in' : (r.status === 'out' ? 'out' : (r.clock_in ? 'in' : 'out')))),
        date: d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (r.date || ''),
        time: d ? d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : (r.time || '')
      };
    });
  } catch (e) {
    console.warn('Failed to load recent activity', e);
  }
};

let timeInterval;

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
  
  if (props.locationEnabled) {
    getCurrentLocation();
  }
  // load recent activity from API
  loadRecentActivity();
  // refresh when other parts of app dispatch 'clock-changed'
  window.addEventListener('clock-changed', loadRecentActivity);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  window.removeEventListener('clock-changed', loadRecentActivity);
});

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getCurrentLocation = async () => {
  if (!navigator.geolocation) return;
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      });
    });
    
    // Here you would reverse geocode the coordinates
    currentLocation.value = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
    locationVerified.value = true;
  } catch (error) {
    currentLocation.value = 'Location unavailable';
    locationVerified.value = false;
  }
};

const toggleClock = async () => {
  isLoading.value = true;
  
  try {
    if (props.clockedIn) {
      await emit('clock-out');
    } else {
      await emit('clock-in');
    }
    // schedule a local refresh: parent may call server, so allow a small delay
    setTimeout(() => loadRecentActivity(), 1500);
  } catch (error) {
    console.error('Clock toggle failed:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Custom animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Touch feedback */
.mobile-clock-widget button:active {
  transform: scale(0.98);
  transition: transform 0.1s;
}
</style>
