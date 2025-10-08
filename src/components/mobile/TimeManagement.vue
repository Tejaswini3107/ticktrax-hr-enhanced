<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">Time Management</h2>

    <Card class="mb-4">
      <CardContent>
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <div class="text-3xl font-bold">{{ totalHours }}</div>
            <div class="text-sm text-muted-foreground">Hours This Week</div>
          </div>
          <div>
            <div class="text-3xl font-bold">{{ overtimeHours }}</div>
            <div class="text-sm text-muted-foreground">Overtime</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="mb-4">
      <CardContent>
        <h3 class="font-semibold mb-2">Recent Time Entries</h3>
        <ul class="space-y-2">
          <li v-for="entry in recentEntries" :key="entry.id" class="flex justify-between">
            <div>
              <div class="font-medium">{{ entry.date }}</div>
              <div class="text-xs text-muted-foreground">{{ entry.clockIn }} — {{ entry.clockOut }}</div>
            </div>
            <div class="text-right">
              <div class="font-semibold">{{ entry.hours }}h</div>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>

    <div class="text-center mt-6">
      <Button @click="requestAdjustment">Request Time Adjustment</Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';

const totalHours = ref('38.5');
const overtimeHours = ref('2.5');

const recentEntries = ref([
  { id: 1, date: '2025-10-07', clockIn: '09:00', clockOut: '17:00', hours: 8 },
  { id: 2, date: '2025-10-06', clockIn: '09:15', clockOut: '17:30', hours: 8.25 },
  { id: 3, date: '2025-10-05', clockIn: '08:45', clockOut: '17:15', hours: 8.5 }
]);

const requestAdjustment = () => {
  alert('Request submitted (demo)');
};
</script>

<style scoped>
.text-muted-foreground { color: rgba(107,114,128,1); }
</style>
