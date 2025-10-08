<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Clock, Play, Square } from 'lucide-vue-next';
import Button from './ui/button.vue';
import Card from './ui/card.vue';
import { CardContent, CardHeader, CardTitle } from './ui/card-components.vue';
import Badge from './ui/badge.vue';
import LocationTracker from './special/LocationTracker.vue';

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

const handleClockIn = () => {
  status.value = 'clocked-in';
  clockedInTime.value = new Date();
};

const handleClockOut = () => {
  status.value = 'clocked-out';
  clockedInTime.value = null;
  elapsedTime.value = 0;
};

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
