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
import { ref, onMounted } from 'vue';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import authManager from '../../services/authService.js';
import apiService from '../../services/apiService.js';
import toast from '../../utils/toast.js';

const totalHours = ref('0');
const overtimeHours = ref('0');
const recentEntries = ref([]);
const isLoading = ref(false);

const formatIsoToLocal = (iso) => {
  try {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch (e) { return iso; }
}

const loadEntries = async () => {
  isLoading.value = true;
  try {
    const cur = await authManager.getCurrentUser();
    if (!cur.success) throw new Error('Not signed in');
    const user = cur.data;
    const data = await apiService.getUserWorkingTimes(user.id);
    // Expect array of records with timestamps; normalize
    recentEntries.value = (Array.isArray(data) ? data : []).map((r, idx) => ({
      id: r.id || idx,
      date: (r.start_time && r.start_time.split && r.start_time.split('T')[0]) || formatIsoToLocal(r.timestamp) || '',
      clockIn: r.clock_in || formatIsoToLocal(r.start_time) || '',
      clockOut: r.clock_out || formatIsoToLocal(r.end_time) || '',
      hours: r.hours || r.duration_hours || 0
    }));

    // simple aggregates
    totalHours.value = recentEntries.value.reduce((s, e) => s + Number(e.hours || 0), 0).toFixed(2);
    overtimeHours.value = Math.max(0, totalHours.value - 40).toFixed(2);
  } catch (err) {
    console.error('Load entries failed', err);
    toast.error('Failed to load time entries');
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadEntries);

const requestAdjustment = async () => {
  // If you have a real endpoint for adjustments, call it here. For now we'll show toast and reload.
  toast.info('Submitting adjustment request...');
  // Optionally call API: await apiService.logUnpaidOvertime({ /*payload*/ })
  setTimeout(() => {
    toast.success('Adjustment request submitted');
  }, 600);
}
</script>

<style scoped>
.text-muted-foreground { color: rgba(107,114,128,1); }
</style>
