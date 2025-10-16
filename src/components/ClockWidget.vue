<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Clock, Play, Square } from 'lucide-vue-next';
import Button from './ui/button.vue';
import Card from './ui/card.vue';
import { CardContent, CardHeader, CardTitle } from './ui/card-components.vue';
import Badge from './ui/badge.vue';
import LocationTracker from './special/LocationTracker.vue';
import { apiService } from '../services/apiService.js';
import authManager from '../services/authService.js';
import realTimeService from '../services/realTimeService.js';

const props = defineProps({
  showLocation: {
    type: Boolean,
    default: false,
  },
});

const status = ref('clocked-out');
const currentTime = ref(new Date());
const clockedInTime = ref(null);
const elapsedTime = ref(0);
const isProcessing = ref(false);

let timer;

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date();
    if (clockedInTime.value) {
      const elapsed = Math.floor(
        (Date.now() - clockedInTime.value.getTime()) / 1000
      );
      elapsedTime.value = elapsed;
    }
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

// Load clock status on mount using new API
onMounted(async () => {
  try {
    if (!authManager.isAuthenticated()) {
      console.log('🚀 User not authenticated, skipping clock status check');
      return;
    }
    
    const clockStatus = await apiService.getClockStatus();
    if (clockStatus && clockStatus.data) {
      if (clockStatus.data.is_clocked_in && clockStatus.data.current_entry) {
        status.value = 'clocked-in';
        const clockInTime = new Date(clockStatus.data.current_entry.clock_in);
        if (!isNaN(clockInTime.getTime())) {
          clockedInTime.value = clockInTime;
          // Initialize elapsed time from server data
          elapsedTime.value = Math.floor((Date.now() - clockInTime.getTime()) / 1000);
        }
        console.log('🕐 Clock status loaded:', clockStatus.data);
      } else {
        status.value = 'clocked-out';
        clockedInTime.value = null;
        elapsedTime.value = 0;
      }
    }
  } catch (e) {
    console.debug('Could not fetch server clock state', e?.message || e);
    // Fallback to clocked-out state
    status.value = 'clocked-out';
    clockedInTime.value = null;
    elapsedTime.value = 0;
  }
  
  // Setup realtime listeners for live clock updates
  const handleClockStatusChanged = (clockStatus) => {
    console.log('📡 ClockWidget: Status changed', clockStatus);
    if (clockStatus.is_clocked_in) {
      status.value = 'clocked-in';
      if (clockStatus.clock_in_time) {
        clockedInTime.value = new Date(clockStatus.clock_in_time);
      }
    } else {
      status.value = 'clocked-out';
      clockedInTime.value = null;
      elapsedTime.value = 0;
    }
  };
  
  // Register realtime listener
  realTimeService.on('clock-status-changed', handleClockStatusChanged);
  
  onUnmounted(() => {
    realTimeService.off('clock-status-changed', handleClockStatusChanged);
  });
});

// Clock in using new time tracking API
const clockIn = async (userId = null) => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  try {
    // Prepare clock in payload with location data if available
    const clockInPayload = {
      work_location: 'WFO', // Default to Work From Office
      notes: 'Clock in from web interface'
    };

    // Try to get location if LocationTracker is available
    try {
      const locationData = await window.navigator.geolocation?.getCurrentPosition();
      if (locationData) {
        clockInPayload.latitude = locationData.coords.latitude;
        clockInPayload.longitude = locationData.coords.longitude;
        clockInPayload.work_location = 'WFO'; // With GPS coordinates
      }
    } catch (locationError) {
      console.log('Location not available, using default location');
    }

    const result = await apiService.clockIn(clockInPayload);
    
    if (result && result.data) {
      status.value = 'clocked-in';
      const clockInTime = new Date(result.data.clock_in);
      if (!isNaN(clockInTime.getTime())) {
        clockedInTime.value = clockInTime;
        elapsedTime.value = Math.floor((Date.now() - clockInTime.getTime()) / 1000);
      }
      console.log('✅ Clocked in successfully:', result.data);
      try { 
        window.dispatchEvent(new CustomEvent('clock-changed', { 
          detail: { status: 'clocked-in', entryId: result.data.id } 
        })); 
      } catch (e) {}
    }
  } catch (err) {
    console.error('Clock in failed:', err);
    // Handle specific error cases
    if (err.message && err.message.includes('already_clocked_in')) {
      console.log('User is already clocked in');
      // Try to get current status
      try {
        const status = await apiService.getClockStatus();
        if (status?.data?.is_clocked_in) {
          // Update UI to reflect current state
          this.status.value = 'clocked-in';
          if (status.data.current_entry?.clock_in) {
            this.clockedInTime.value = new Date(status.data.current_entry.clock_in);
          }
        }
      } catch (statusError) {
        console.error('Could not get clock status:', statusError);
      }
    }
  } finally {
    isProcessing.value = false;
  }
};

const clockOut = async (userId = null) => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  try {
    // Prepare clock out payload
    const clockOutPayload = {
      notes: 'Clock out from web interface'
    };

    const result = await apiService.clockOut(clockOutPayload);
    
    if (result && result.data) {
      status.value = 'clocked-out';
      clockedInTime.value = null;
      elapsedTime.value = 0;
      console.log('✅ Clocked out successfully:', result.data);
      try { 
        window.dispatchEvent(new CustomEvent('clock-changed', { 
          detail: { 
            status: 'clocked-out', 
            entryId: result.data.id,
            totalHours: result.data.total_hours 
          } 
        })); 
      } catch (e) {}
    }
  } catch (err) {
    console.error('Clock out failed:', err);
  } finally {
    isProcessing.value = false;
  }
};

const handleClockIn = () => { clockIn(); };
const handleClockOut = () => { clockOut(); };

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatElapsed = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const badgeVariant = computed(() =>
  status.value === 'clocked-in' ? 'default' : 'secondary'
);

const badgeClass = computed(() =>
  status.value === 'clocked-in'
    ? 'bg-green-500 hover:bg-green-600'
    : undefined
);
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle class="flex items-center gap-2">
          <Clock class="h-5 w-5" />
          Time Clock
        </CardTitle>
        <Badge :variant="badgeVariant" :class="badgeClass">
          {{ status === 'clocked-in' ? 'Clocked In' : 'Clocked Out' }}
        </Badge>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="text-center">
        <div class="text-4xl tabular-nums">{{ formatTime(currentTime) }}</div>
        <div class="text-sm text-muted-foreground mt-1">
          {{
            currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          }}
        </div>
      </div>

      <div
        v-if="status === 'clocked-in'"
        class="bg-accent/50 rounded-lg p-4 text-center"
      >
        <div class="text-sm text-muted-foreground">Time Elapsed</div>
        <div class="text-2xl tabular-nums mt-1">
          {{ formatElapsed(elapsedTime) }}
        </div>
      </div>

      <div
        v-if="showLocation && status === 'clocked-in'"
        class="flex justify-center"
      >
        <LocationTracker />
      </div>

      <div class="flex gap-2">
        <Button
          v-if="status === 'clocked-out'"
          @click="handleClockIn"
          class="w-full gap-2"
          size="lg"
        >
          <Play class="h-5 w-5" />
          Clock In
        </Button>
        <Button
          v-else
          @click="handleClockOut"
          variant="destructive"
          class="w-full gap-2"
          size="lg"
        >
          <Square class="h-5 w-5" />
          Clock Out
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
