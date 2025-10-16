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
import { ref, onMounted } from 'vue';
import toast from '../../utils/toast.js';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import apiService from '../../services/apiService.js';
import authManager from '../../services/authService.js';

const schedule = ref([]);
const loading = ref(false);

const loadSchedule = async () => {
  loading.value = true;
  try {
    const cur = await authManager.getCurrentUser();
    if (!cur.success) {
      toast.error('Not signed in');
      return;
    }
    const uid = cur.data?.id || cur.data?.attributes?.id || null;
    if (!uid) return;
    const data = await apiService.getEmployeeScheduleConstraints(uid);
    const rows = Array.isArray(data) ? data : (data?.data || []);
    schedule.value = rows.map((r, idx) => ({
      id: r.id || idx,
      day: r.day || (r.start_date ? new Date(r.start_date).toLocaleDateString('en-US', { weekday: 'long' }) : 'N/A'),
      time: r.time || `${r.start_time || ''} - ${r.end_time || ''}`.trim(),
      location: r.location || r.site || 'Unassigned'
    }));
  } catch (e) {
    console.error('Failed to load schedule', e);
    toast.error('Unable to load schedule');
  } finally {
    loading.value = false;
  }
};

const requestTimeOff = async () => {
  const date = window.prompt('Enter date for time off (YYYY-MM-DD):', '');
  if (!date) return;
  const reason = window.prompt('Reason for time off (optional):', '');
  try {
    const cur = await authManager.getCurrentUser();
    const uid = cur.data?.id || cur.data?.attributes?.id || null;
    if (!uid) {
      toast.error('Not signed in');
      return;
    }
    // Best-effort payload for createBatchSchedules
    const payload = { requests: [{ employee_id: uid, date, type: 'time_off', reason }] };
    await apiService.createBatchSchedules(payload);
    toast.success('Time off request submitted');
  } catch (e) {
    console.error('Request time off failed', e);
    toast.error('Failed to submit time off request');
  }
};

onMounted(loadSchedule);
</script>

<style scoped>
.text-muted-foreground { color: rgba(107,114,128,1); }
</style>
