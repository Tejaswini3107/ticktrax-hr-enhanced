<template>
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-4">Analytics</h2>

    <div class="grid gap-4">
      <Card class="p-4">
        <h3 class="font-medium">Usage Overview</h3>
        <div class="mt-2 text-sm text-muted-foreground">Active Users: <strong>{{ stats.activeUsers }}</strong></div>
        <div class="text-sm text-muted-foreground">Hours Logged Today: <strong>{{ stats.hoursToday }}</strong></div>
      </Card>

      <Card class="p-4">
        <h3 class="font-medium">Top Departments</h3>
        <ul class="mt-2 list-disc pl-5 text-sm">
          <li v-for="d in topDepartments" :key="d.name">{{ d.name }} — {{ d.metric }}</li>
        </ul>
      </Card>
    </div>
  </div>
</template>

<script setup>
console.debug('[Analytics] module loaded');
import { ref, onMounted } from 'vue';
import Card from '../ui/card.vue';

const stats = ref({ activeUsers: 128, hoursToday: '420h' });
const topDepartments = ref([
  { name: 'Engineering', metric: '320h' },
  { name: 'Support', metric: '210h' },
  { name: 'Sales', metric: '180h' },
]);

onMounted(() => {
  console.debug('[Analytics] mounted');
});
</script>

<style scoped>
</style>
