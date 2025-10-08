<script setup>
import { ref, onMounted } from 'vue';
import {
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-vue-next';
import Badge from '../ui/badge.vue';

const props = defineProps({
  showAddress: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['location-update']);

const status = ref('idle');
const location = ref(null);
const address = ref('');

const getLocation = () => {
  status.value = 'loading';

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        location.value = loc;
        status.value = 'success';

        const mockAddress = `${Math.abs(loc.lat).toFixed(4)}°${
          loc.lat >= 0 ? 'N' : 'S'
        }, ${Math.abs(loc.lng).toFixed(4)}°${loc.lng >= 0 ? 'E' : 'W'}`;
        address.value = mockAddress;

        emit('location-update', { ...loc, address: mockAddress });
      },
      (error) => {
        console.error('Location error:', error);
        status.value = 'error';
      }
    );
  } else {
    status.value = 'error';
  }
};

onMounted(() => {
  getLocation();
});

const getStatusIcon = () => {
  switch (status.value) {
    case 'loading':
      return Loader;
    case 'success':
      return CheckCircle;
    case 'error':
      return AlertCircle;
    default:
      return MapPin;
  }
};

const getStatusText = () => {
  switch (status.value) {
    case 'loading':
      return 'Getting location...';
    case 'success':
      return 'Location verified';
    case 'error':
      return 'Location unavailable';
    default:
      return 'Not tracked';
  }
};
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      class="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-lg"
    >
      <component
        :is="getStatusIcon()"
        :class="{
          'h-4 w-4': true,
          'animate-spin': status === 'loading',
          'text-green-600': status === 'success',
          'text-red-600': status === 'error',
        }"
      />
      <span class="text-sm">{{ getStatusText() }}</span>
    </div>
    <Badge
      v-if="status === 'success' && showAddress"
      variant="secondary"
      class="gap-1"
    >
      <MapPin class="h-3 w-3" />
      {{ address }}
    </Badge>
  </div>
</template>
