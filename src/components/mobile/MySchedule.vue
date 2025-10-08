<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">My Schedule</h2>

    <Card class="mb-4">
      <CardContent>
        <ul class="space-y-3">
          <li v-for="item in schedule" :key="item.id" class="flex justify-between items-center">
            <div>
              <div class="font-medium">{{ item.day }}</div>
              <div class="text-xs text-muted-foreground">{{ item.time }}</div>
            </div>
            <div class="text-right text-sm">{{ item.location }}</div>
          </li>
        </ul>
      </CardContent>
    </Card>

    <div class="text-center mt-6">
      <Button variant="outline" @click="requestTimeOff">Request Time Off</Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';

const schedule = ref([
  { id: 1, day: 'Monday', time: '09:00 - 17:00', location: 'Office' },
  { id: 2, day: 'Tuesday', time: '09:30 - 17:30', location: 'Office' },
  { id: 3, day: 'Wednesday', time: '09:00 - 17:00', location: 'Remote' },
  { id: 4, day: 'Thursday', time: '09:00 - 17:00', location: 'Office' },
  { id: 5, day: 'Friday', time: '09:00 - 16:00', location: 'Office' }
]);

const requestTimeOff = () => {
  alert('Time off request submitted (demo)');
};
</script>

<style scoped>
.text-muted-foreground { color: rgba(107,114,128,1); }
</style>
