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
import { ref } from 'vue';
import { onMounted } from 'vue';
import toast from '../../utils/toast.js';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';

const teamHours = ref('320');
const onDuty = ref(5);

const members = ref([
  { id: 1, name: 'Alice Johnson', role: 'Employee', initials: 'AJ' },
  { id: 2, name: 'Bob Smith', role: 'Employee', initials: 'BS' },
  { id: 3, name: 'Carol Lee', role: 'Manager', initials: 'CL' }
]);

const viewProfile = (m) => {
  toast.info(`Viewing profile: ${m.name}`);
};

const message = (m) => {
  toast.info(`Opening chat with ${m.name}`);
};

const refresh = () => {
  toast.info('Refreshing team data...');
};

onMounted(() => {
  console.debug('[TeamOverview] mounted');
});
</script>

<style scoped>
.text-muted-foreground { color: rgba(107,114,128,1); }
</style>
