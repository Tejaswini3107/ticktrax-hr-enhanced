<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">Alerts</h2>

    <Card class="mb-4">
      <CardContent>
        <div class="text-sm text-muted-foreground mb-3">System and team alerts</div>
        <ul class="space-y-3">
          <li v-for="alertItem in alertItems" :key="alertItem.id" class="flex items-start justify-between">
            <div>
              <div class="font-medium">{{ alertItem.title }}</div>
              <div class="text-xs text-muted-foreground">{{ alertItem.time }}</div>
            </div>
            <div class="text-sm text-primary font-semibold">{{ alertItem.severity }}</div>
          </li>
        </ul>
      </CardContent>
    </Card>

    <div class="text-center mt-6">
      <Button @click="refresh">Refresh</Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import toast from '../../utils/toast.js';
import apiService from '../../services/apiService.js';
import authManager from '../../services/authService.js';

const alertItems = ref([]);

const loadAlerts = async () => {
  try {
    const cur = await authManager.getCurrentUser();
    if (!cur.success) throw new Error('Not signed in');

    // Try backend alert endpoints if present; else build simple alerts from API checks
    const alerts = [];

    // Example: nightShiftAlert or presenceVerification endpoints
    try {
      const night = await apiService.nightShiftAlert();
      if (night && Array.isArray(night)) night.slice(0,5).forEach(a => alerts.push({ id: a.id || a.timestamp, title: a.title || a.type || 'Night shift alert', time: a.time || a.timestamp || '', severity: a.severity || 'High' }));
    } catch (_) {}

    try {
      const pv = await apiService.presenceVerification();
      if (pv && Array.isArray(pv)) pv.slice(0,5).forEach(a => alerts.push({ id: a.id || a.timestamp, title: a.title || a.type || 'Presence verification', time: a.time || a.timestamp || '', severity: a.severity || 'Medium' }));
    } catch (_) {}

    // Fallback: if no alerts returned, show an empty array
    alertItems.value = alerts.length ? alerts : [];
  } catch (err) {
    console.warn('loadAlerts failed', err);
    toast.error('Unable to load alerts');
  }
};

const refresh = async () => {
  toast.info('Refreshing alerts...');
  await loadAlerts();
};

onMounted(loadAlerts);
</script>

<style scoped>
.text-muted-foreground { color: rgba(107,114,128,1); }
</style>
