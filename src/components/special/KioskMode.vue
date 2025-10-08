<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import Input from '../ui/input.vue';
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  MapPin,
  Navigation,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-vue-next';
import Badge from '../ui/badge.vue';
import { useToast } from '../ui/toast/use-toast.js';

const { toast } = useToast();

const location = ref('');
const isLoadingLocation = ref(false);
const locationError = ref(null);
const recentEntries = ref([]);
const currentTime = ref(new Date());

// Mock user ID for API calls (would come from logged-in session)
const currentUserId = 'user_123';

let interval;

onMounted(() => {
  interval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(interval);
});

const fetchLocation = async () => {
  isLoadingLocation.value = true;
  locationError.value = null;

  try {
    if ('geolocation' in navigator) {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => {
            let errorMessage = 'Unknown location error';
            let userMessage = 'Unable to detect location';

            switch (err.code) {
              case err.PERMISSION_DENIED:
                errorMessage = 'Location access denied by user';
                userMessage =
                  'Location access blocked. Click browser location icon to enable.';
                break;
              case err.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable';
                userMessage =
                  'Location unavailable. Please enter manually.';
                break;
              case err.TIMEOUT:
                errorMessage = 'Location request timed out';
                userMessage =
                  'Location request timed out. Please try again.';
                break;
              default:
                errorMessage = err.message || 'Geolocation failed';
                userMessage =
                  'Location detection failed. Please enter manually.';
            }

            const error = new Error(errorMessage);
            error.userMessage = userMessage;
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });

      // Convert coordinates to a readable location
      const { latitude, longitude } = position.coords;

      // Mock location based on coordinates
      const mockLocations = [
        'Warehouse - Section A',
        'Warehouse - Section B',
        'Warehouse - Loading Dock',
        'Warehouse - Office Area',
        'Warehouse - Storage Floor',
      ];

      const locationIndex =
        Math.floor(Math.abs(latitude + longitude)) %
        mockLocations.length;
      location.value = mockLocations[locationIndex];
      locationError.value = null;

      toast({
        title: 'Success',
        description: 'Location detected successfully',
      });
    } else {
      throw new Error('Geolocation not supported by this browser');
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to get location';
    const userMessage =
      error?.userMessage || 'Location detection failed';

    console.warn('Location fetch failed:', errorMessage);

    locationError.value = userMessage;
    location.value = 'Warehouse - General Area';

    if (errorMessage.includes('denied')) {
      toast({
        title: 'Location access blocked',
        description:
          "Click the location icon in your browser's address bar to enable location access.",
        duration: 5000,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Using default location',
        description:
          'You can manually change the location if needed.',
        duration: 3000,
        variant: 'warning',
      });
    }
  } finally {
    isLoadingLocation.value = false;
  }
};

const handleLocationClick = () => {
  if (!isLoadingLocation.value) {
    fetchLocation();
  }
};

const handleClockIn = async () => {
  if (!location.value.trim()) return;

  try {
    const entry = {
      action: 'in',
      timestamp: currentTime.value.toLocaleTimeString(),
      location: location.value.trim(),
      userId: currentUserId,
    };

    recentEntries.value = [entry, ...recentEntries.value.slice(0, 4)];
    location.value = '';
  } catch (error) {
    console.error('Clock in failed:', error);
  }
};

const handleClockOut = async () => {
  if (!location.value.trim()) return;

  try {
    const entry = {
      action: 'out',
      timestamp: currentTime.value.toLocaleTimeString(),
      location: location.value.trim(),
      userId: currentUserId,
    };

    recentEntries.value = [entry, ...recentEntries.value.slice(0, 4)];
    location.value = '';
  } catch (error) {
    console.error('Clock out failed:', error);
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-background p-8 flex flex-col items-center justify-center"
  >
    <div class="w-full max-w-2xl space-y-6">
      <!-- Header -->
      <div class="text-center space-y-4">
        <div class="flex items-center justify-center gap-3">
          <div
            class="h-16 w-16 rounded-xl bg-primary flex items-center justify-center"
          >
            <Clock class="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 class="text-4xl">Warehouse Time Clock</h1>
        <div
          class="text-5xl font-mono bg-card border-2 border-border rounded-xl p-6"
        >
          {{ currentTime.toLocaleTimeString() }}
        </div>
        <p class="text-xl text-muted-foreground">
          {{
            currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          }}
        </p>
      </div>

      <!-- Main Input Card -->
      <Card class="border-2">
        <CardContent class="pt-8 pb-8 space-y-6">
          <div class="space-y-4">
            <div class="space-y-3">
              <label class="text-xl flex items-center gap-2">
                <MapPin class="h-5 w-5" />
                Work Location
              </label>
              <div class="space-y-2">
                <div class="relative">
                  <Input
                    id="location-input"
                    type="text"
                    placeholder="Click to detect location or enter manually..."
                    v-model="location"
                    @click="handleLocationClick"
                    @keydown.enter="
                      location.trim() && handleClockIn()
                    "
                    :class="[
                      'text-2xl h-16 text-center pr-12 cursor-pointer',
                      locationError ? 'border-orange-500' : '',
                    ]"
                    :readonly="isLoadingLocation"
                  />
                  <div
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2"
                  >
                    <Button
                      v-if="locationError"
                      variant="ghost"
                      size="sm"
                      @click="fetchLocation"
                      :disabled="isLoadingLocation"
                      class="h-8 w-8 p-0"
                    >
                      <RefreshCw class="h-4 w-4" />
                    </Button>
                    <Loader2
                      v-if="isLoadingLocation"
                      class="h-6 w-6 animate-spin text-muted-foreground"
                    />
                    <AlertCircle
                      v-else-if="locationError"
                      class="h-6 w-6 text-orange-500"
                    />
                    <Navigation
                      v-else
                      class="h-6 w-6 text-muted-foreground"
                    />
                  </div>
                </div>

                <div
                  v-if="locationError"
                  class="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-2 rounded-md"
                >
                  <AlertCircle class="h-4 w-4 flex-shrink-0" />
                  <span>{{ locationError }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              class="h-20 text-xl gap-3 bg-green-600 hover:bg-green-700"
              @click="handleClockIn"
              :disabled="!location.trim() || isLoadingLocation"
            >
              <LogIn class="h-6 w-6" />
              Clock In
            </Button>
            <Button
              size="lg"
              class="h-20 text-xl gap-3 bg-red-600 hover:bg-red-700"
              @click="handleClockOut"
              :disabled="!location.trim() || isLoadingLocation"
            >
              <LogOut class="h-6 w-6" />
              Clock Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Activity -->
      <Card v-if="recentEntries.length > 0">
        <CardContent class="pt-6">
          <h3 class="mb-4 flex items-center gap-2">
            <CheckCircle class="h-5 w-5" />
            Recent Activity
          </h3>
          <div class="space-y-2">
            <div
              v-for="(entry, index) in recentEntries"
              :key="index"
              class="flex items-center justify-between p-4 bg-accent/30 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div
                  :class="[
                    'h-10 w-10 rounded-full flex items-center justify-center',
                    entry.action === 'in'
                      ? 'bg-green-500/20'
                      : 'bg-red-500/20',
                  ]"
                >
                  <LogIn
                    v-if="entry.action === 'in'"
                    class="h-5 w-5 text-green-600"
                  />
                  <LogOut v-else class="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p class="font-medium">Time Clock Entry</p>
                  <p
                    class="text-sm text-muted-foreground flex items-center gap-1"
                  >
                    <MapPin class="h-3 w-3" />
                    {{ entry.location }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <Badge
                  :variant="
                    entry.action === 'in' ? 'default' : 'secondary'
                  "
                  :class="
                    entry.action === 'in'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  "
                >
                  {{
                    entry.action === 'in'
                      ? 'Clocked In'
                      : 'Clocked Out'
                  }}
                </Badge>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ entry.timestamp }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Footer -->
      <div class="text-center text-sm text-muted-foreground">
        <p>
          Having trouble? Contact your supervisor or IT support
        </p>
      </div>
    </div>
  </div>
</template>
