<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">Approvals</h2>

    <Card class="mb-4">
      <CardContent>
        <div class="text-sm text-muted-foreground mb-3">Pending approvals for your review</div>
        <ul class="space-y-3">
          <li v-for="item in approvals" :key="item.id" class="flex items-start justify-between gap-4">
            <div>
              <div class="font-medium">{{ item.title }}</div>
              <div class="text-xs text-muted-foreground">Submitted by {{ item.by }} • {{ item.date }}</div>
            </div>
            <div class="flex items-center gap-2">
              <Button size="sm" variant="ghost" @click="reject(item)">Reject</Button>
              <Button size="sm" @click="approve(item)">Approve</Button>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>

    <div class="text-center mt-6">
      <Button @click="loadMore">Load more</Button>
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

const approvals = ref([]);
const isLoading = ref(false);

const loadApprovals = async () => {
  try {
    isLoading.value = true;
    const cur = await authManager.getCurrentUser();
    if (!cur.success) throw new Error('Not signed in');

    // Collect pending approvals by scanning recent working times for team users
    const users = await apiService.listUsers();
    const list = [];
    for (const u of (Array.isArray(users) ? users : []).slice(0, 30)) {
      try {
        const uid = u.id || u.attributes?.id;
        const times = await apiService.getUserWorkingTimes(uid);
        const pending = (Array.isArray(times) ? times : []).filter(t => t.pending_approval || t.status === 'pending');
        pending.slice(0,2).forEach(p => list.push({
          id: p.id || `${uid}-${p.timestamp || p.start_time}`,
          title: p.type || 'Time Entry',
          by: u.attributes?.email || u.email || u.name || 'Unknown',
          date: (p.start_time || p.timestamp || '').split('T')[0] || '-',
          raw: p,
          userId: uid
        }));
      } catch (e) {
        console.warn('loadApprovals: failed for user', e);
      }
    }
    approvals.value = list.slice(0, 50);
  } catch (err) {
    console.warn('loadApprovals failed', err);
    toast.error('Unable to load approvals from server');
  } finally {
    isLoading.value = false;
  }
};

const approve = async (item) => {
  try {
    // If API has a timesheet id, attempt to validate via API
    if (item.raw?.id) {
      await apiService.validateTimesheet(item.raw.id, { approved: true });
      toast.success(`Approved: ${item.title}`);
    } else {
      toast.success(`Approved: ${item.title}`);
    }
    approvals.value = approvals.value.filter(a => a.id !== item.id);
  } catch (e) {
    console.error('approve failed', e);
    toast.error('Unable to approve entry');
  }
};

const reject = async (item) => {
  try {
    if (item.raw?.id) {
      await apiService.validateTimesheet(item.raw.id, { approved: false, reason: 'Rejected by manager' });
      toast.warning(`Rejected: ${item.title}`);
    } else {
      toast.warning(`Rejected: ${item.title}`);
    }
    approvals.value = approvals.value.filter(a => a.id !== item.id);
  } catch (e) {
    console.error('reject failed', e);
    toast.error('Unable to reject entry');
  }
};

const loadMore = async () => {
  toast.info('Loading more approvals...');
  // Try to fetch again (could implement paging later)
  await loadApprovals();
};

onMounted(loadApprovals);
</script>

<style scoped>
.text-muted-foreground { color: rgba(107,114,128,1); }
</style>
