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

// Attempt to load server clock state separately on mount
onMounted(async () => {
  try {
    const res = await authManager.getCurrentUser();
    const uid = res?.data?.id;
    if (!uid) return;
    const clockData = await apiService.getUserClock(uid);
    const d = Array.isArray(clockData) ? clockData[0] : (clockData || {});
    const s = d?.status || d?.state || (d?.clock_out ? 'clocked-out' : (d?.clock_in ? 'clocked-in' : null));
    const ts = d?.clock_in || d?.clocked_in_at || d?.start_time || d?.timestamp || null;
    if (s === 'clocked-in' || s === 'in' || s === 'active') {
      status.value = 'clocked-in';
      if (ts) {
        const parsed = new Date(ts);
        if (!isNaN(parsed.getTime())) {
          clockedInTime.value = parsed;
          // initialize elapsedTime from server timestamp
          elapsedTime.value = Math.floor((Date.now() - parsed.getTime()) / 1000);
        }
      }
    } else {
      status.value = 'clocked-out';
      clockedInTime.value = null;
      elapsedTime.value = 0;
    }
  } catch (e) {
    console.debug('Could not fetch server clock state', e?.message || e);
  }
});

// Backend-backed clock in/out
const clockIn = async (userId = null) => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  try {
    let uid = userId;
    if (!uid) {
      const res = await authManager.getCurrentUser();
      uid = res?.data?.id;
    }
    if (!uid) throw new Error('No user id');
    const result = await apiService.clockInOut(uid, 'clocked-in');
    // Prefer server-provided timestamp when available
    const serverTs = result?.clock_in || result?.clocked_in_at || result?.start_time || result?.timestamp || result?.data?.clock_in;
    status.value = 'clocked-in';
    if (serverTs) {
      const parsed = new Date(serverTs);
      if (!isNaN(parsed.getTime())) {
        clockedInTime.value = parsed;
        elapsedTime.value = Math.floor((Date.now() - parsed.getTime()) / 1000);
      } else {
        clockedInTime.value = new Date();
        elapsedTime.value = 0;
      }
    } else {
      clockedInTime.value = new Date();
      elapsedTime.value = 0;
    }
    try { window.dispatchEvent(new CustomEvent('clock-changed', { detail: { status: 'clocked-in', userId: uid } })); } catch (e) {}
  } catch (err) {
    console.error('Clock in failed', err);
  } finally {
    isProcessing.value = false;
  }
};

const clockOut = async (userId = null) => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  try {
    let uid = userId;
    if (!uid) {
      const res = await authManager.getCurrentUser();
      uid = res?.data?.id;
    }
    if (!uid) throw new Error('No user id');
    const result = await apiService.clockInOut(uid, 'clocked-out');
    // If server returns final timestamps, we can compute final elapsed or simply clear
    const serverOut = result?.clock_out || result?.clocked_out_at || result?.end_time || result?.timestamp || result?.data?.clock_out;
    status.value = 'clocked-out';
    clockedInTime.value = null;
    elapsedTime.value = 0;
    try { window.dispatchEvent(new CustomEvent('clock-changed', { detail: { status: 'clocked-out', userId: uid } })); } catch (e) {}
  } catch (err) {
    console.error('Clock out failed', err);
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
