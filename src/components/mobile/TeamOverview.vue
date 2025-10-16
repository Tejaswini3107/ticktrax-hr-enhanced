<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">Team Overview</h2>

    <Card class="mb-4">
      <CardContent>
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="text-sm text-muted-foreground">Team Performance</div>
            <div class="text-2xl font-bold">{{ teamHours }}h</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-muted-foreground">On Duty</div>
            <div class="text-2xl font-bold">{{ onDuty }}</div>
          </div>
        </div>

        <h4 class="font-medium mb-2">Members</h4>
        <ul class="space-y-3">
          <li v-for="member in members" :key="member.id" class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">{{ member.initials }}</div>
              <div>
                <div class="font-medium">{{ member.name }}</div>
                <div class="text-xs text-muted-foreground">{{ member.role }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Button size="sm" variant="ghost" @click="message(member)">Message</Button>
              <Button size="sm" @click="viewProfile(member)">View</Button>
            </div>
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
import toast from '../../utils/toast.js';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import apiService from '../../services/apiService.js';
import authManager from '../../services/authService.js';

const teamHours = ref(0);
const onDuty = ref(0);
const members = ref([]);
const isLoading = ref(false);

const loadTeam = async () => {
  try {
    isLoading.value = true;
    const cur = await authManager.getCurrentUser();
    if (!cur.success) throw new Error('Not signed in');

    const users = await apiService.listUsers();
    const uarr = Array.isArray(users) ? users : [];
    const mems = [];
    let totalHours = 0;
    let dutyCount = 0;

    for (const u of uarr.slice(0, 50)) {
      const uid = u.id || u.attributes?.id;
      mems.push({ id: uid, name: u.attributes?.first_name ? `${u.attributes.first_name} ${u.attributes.last_name}` : (u.name || u.email || 'Unknown'), role: u.role || u.attributes?.role || 'Employee', initials: (u.attributes?.first_name || u.name || 'U').slice(0,1).toUpperCase() });
      try {
        const times = await apiService.getUserWorkingTimes(uid);
        const hours = (Array.isArray(times) ? times : []).reduce((acc, t) => acc + (Number(t.duration_hours || t.hours || 0) || 0), 0);
        totalHours += hours;
        // If they have a recent active clock record, count as on-duty
        const active = (Array.isArray(times) ? times : []).some(t => t.status === 'running' || t.status === 'in_progress');
        if (active) dutyCount += 1;
      } catch (e) {
        console.warn('loadTeam: failed fetching times for', uid, e);
      }
    }

    members.value = mems.slice(0, 50);
    teamHours.value = Math.round(totalHours);
    onDuty.value = dutyCount;
  } catch (err) {
    console.warn('loadTeam failed', err);
    toast.error('Unable to load team data');
  } finally {
    isLoading.value = false;
  }
};

const viewProfile = (m) => {
  toast.info(`Viewing profile: ${m.name}`);
};

const message = (m) => {
  toast.info(`Opening chat with ${m.name}`);
};

const refresh = async () => {
  toast.info('Refreshing team data...');
  await loadTeam();
};

onMounted(loadTeam);
</script>

<style scoped>
.text-muted-foreground { color: rgba(107,114,128,1); }
</style>
