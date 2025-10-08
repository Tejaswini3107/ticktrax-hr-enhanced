<script setup>
import { ref, watch, computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.vue';
import Button from '../ui/button.vue';
import Input from '../ui/input.vue';
import Label from '../ui/label.vue';
import Switch from '../ui/switch.vue';
import Card from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import { Separator } from '../ui/separator.vue';
import { Clock, Calendar, AlertCircle } from 'lucide-vue-next';
import { useToast } from '../ui/toast/use-toast.js';

const props = defineProps({
  open: Boolean,
  initialSettings: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:open', 'save']);

const { toast } = useToast();

const defaultSettings = {
  standardHours: 40,
  workDays: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  },
  dailyHours: {
    monday: 8,
    tuesday: 8,
    wednesday: 8,
    thursday: 8,
    friday: 8,
    saturday: 0,
    sunday: 0,
  },
  flexibleSchedule: false,
  minimumHours: 35,
  maximumHours: 45,
};

const settings = ref({
  ...defaultSettings,
  ...props.initialSettings,
});

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      settings.value = {
        ...defaultSettings,
        ...props.initialSettings,
      };
    }
  }
);

const handleWorkDayChange = (day, enabled) => {
  settings.value.workDays[day] = enabled;
  settings.value.dailyHours[day] = enabled ? 8 : 0;
};

const handleDailyHoursChange = (day, hours) => {
  settings.value.dailyHours[day] = Math.max(0, Math.min(24, hours));
};

const totalHours = computed(() => {
  return Object.values(settings.value.dailyHours).reduce(
    (sum, hours) => sum + hours,
    0
  );
});

const isWithinLimits = computed(
  () =>
    totalHours.value >= settings.value.minimumHours &&
    totalHours.value <= settings.value.maximumHours
);

const handleSave = () => {
  if (!isWithinLimits.value) {
    toast({
      title: 'Error',
      description: `Total weekly hours must be between ${settings.value.minimumHours} and ${settings.value.maximumHours} hours`,
      variant: 'destructive',
    });
    return;
  }

  const updatedSettings = {
    ...settings.value,
    standardHours: totalHours.value,
  };

  emit('save', updatedSettings);
  toast({
    title: 'Success',
    description: 'Work week settings updated successfully!',
  });
  emit('update:open', false);
};

const dayNames = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Calendar class="h-5 w-5" />
          Work Week Settings
        </DialogTitle>
        <DialogDescription>
          Configure standard work week policies and daily hour
          requirements.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Work Week Summary -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Clock class="h-4 w-4" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="text-sm text-muted-foreground"
                  >Total Weekly Hours</Label
                >
                <p
                  :class="[
                    'text-2xl font-medium',
                    isWithinLimits
                      ? 'text-foreground'
                      : 'text-destructive',
                  ]"
                >
                  {{ totalHours }}h
                </p>
              </div>
              <div>
                <Label class="text-sm text-muted-foreground">Work Days</Label>
                <p class="text-2xl font-medium">
                  {{
                    Object.values(settings.workDays).filter(Boolean)
                      .length
                  }}
                </p>
              </div>
            </div>
            <div
              v-if="!isWithinLimits"
              class="flex items-center gap-2 mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md"
            >
              <AlertCircle class="h-4 w-4 text-destructive" />
              <span class="text-sm text-destructive">
                Total hours must be between {{ settings.minimumHours }}-{{
                  settings.maximumHours
                }}
                hours
              </span>
            </div>
          </CardContent>
        </Card>

        <!-- Global Settings -->
        <Card>
          <CardHeader>
            <CardTitle>Global Settings</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <Label>Flexible Schedule</Label>
                <p class="text-sm text-muted-foreground">
                  Allow employees to adjust daily hours within limits
                </p>
              </div>
              <Switch
                :checked="settings.flexibleSchedule"
                @update:checked="settings.flexibleSchedule = $event"
              />
            </div>

            <Separator />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="minHours">Minimum Weekly Hours</Label>
                <Input
                  id="minHours"
                  type="number"
                  v-model.number="settings.minimumHours"
                  min="0"
                  max="168"
                />
              </div>
              <div>
                <Label for="maxHours">Maximum Weekly Hours</Label>
                <Input
                  id="maxHours"
                  type="number"
                  v-model.number="settings.maximumHours"
                  min="0"
                  max="168"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Daily Schedule -->
        <Card>
          <CardHeader>
            <CardTitle>Daily Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="{ key, label } in dayNames"
                :key="key"
                class="flex items-center justify-between p-3 border rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <Switch
                    :checked="settings.workDays[key]"
                    @update:checked="handleWorkDayChange(key, $event)"
                  />
                  <Label class="font-medium">{{ label }}</Label>
                </div>
                <div class="flex items-center gap-2">
                  <Input
                    type="number"
                    :value="settings.dailyHours[key]"
                    @input="
                      handleDailyHoursChange(
                        key,
                        parseInt($event.target.value) || 0
                      )
                    "
                    :disabled="!settings.workDays[key]"
                    min="0"
                    max="24"
                    class="w-20"
                  />
                  <span class="text-sm text-muted-foreground">hours</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button @click="handleSave" :disabled="!isWithinLimits">
          Save Settings
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
