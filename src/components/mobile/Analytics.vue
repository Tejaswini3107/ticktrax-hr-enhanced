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
import apiService from '../../services/apiService.js';
import { toast } from 'vue-sonner';

const stats = ref({ activeUsers: 0, hoursToday: '0h' });
const topDepartments = ref([]);
const loading = ref(false);

const toISODate = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const loadAnalytics = async () => {
  loading.value = true;
  try {
    const users = await apiService.listUsers();
    const userArray = Array.isArray(users) ? users : (users?.data || []);
    stats.value.activeUsers = userArray.filter(u => {
      const attrs = u.attributes || {};
      const status = (attrs.status || u.status || 'active').toLowerCase();
      return status === 'active';
    }).length;

    // Aggregate hours for today by department. Limit users to first 30 to avoid heavy network usage on mobile.
    const today = toISODate(new Date());
    const deptHours = {};
    let totalHoursToday = 0;

    const sample = userArray.slice(0, 30);
    const workPromises = sample.map(async (u) => {
      const userId = u.id || u.attributes?.id;
      if (!userId) return;
      try {
        const times = await apiService.getUserWorkingTimes(userId);
        const rows = Array.isArray(times) ? times : (times?.data || []);
        for (const r of rows) {
          const start = r.start_time || r.timestamp || '';
          const datePart = start ? String(start).split('T')[0] : '';
          if (datePart === today) {
            const hours = Number(r.duration_hours || r.hours || 0) || 0;
            totalHoursToday += hours;
            const dept = r.department || u.attributes?.department || u.department || 'Unknown';
            deptHours[dept] = (deptHours[dept] || 0) + hours;
          }
        }
      } catch (e) {
        // ignore per-user failures
        console.warn('Analytics: user times load failed for', userId, e);
      }
    });

    await Promise.all(workPromises);

    stats.value.hoursToday = `${Math.round(totalHoursToday)}h`;

    const sorted = Object.entries(deptHours)
      .map(([name, metric]) => ({ name, metric: `${Math.round(metric)}h` }))
      .sort((a, b) => parseInt(b.metric) - parseInt(a.metric));
    topDepartments.value = sorted.slice(0, 5);
  } catch (err) {
    console.error('Analytics load failed', err);
    toast.error('Unable to load analytics from server');
  } finally {
    loading.value = false;
  }
};

onMounted(loadAnalytics);
</script>

<style scoped>
</style>
