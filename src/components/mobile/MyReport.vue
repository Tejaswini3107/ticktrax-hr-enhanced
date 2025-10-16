<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">My Report</h2>

    <Card class="mb-4">
      <CardContent>
        <h3 class="font-semibold mb-2">This Month</h3>
        <div class="grid grid-cols-2 gap-4 text-center mb-4">
          <div>
            <div class="text-3xl font-bold">{{ hoursThisMonth }}</div>
            <div class="text-sm text-muted-foreground">Hours</div>
          </div>
          <div>
            <div class="text-3xl font-bold">{{ daysWorked }}</div>
            <div class="text-sm text-muted-foreground">Days Worked</div>
          </div>
        </div>

        <h4 class="font-medium mb-2">Recent Notes</h4>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li v-for="note in notes" :key="note.id">{{ note.text }}</li>
        </ul>
      </CardContent>
    </Card>

    <div class="text-center mt-6">
      <Button @click="exportReport">Export PDF</Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import toast from '../../utils/toast.js';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';

const hoursThisMonth = ref('142h');
const daysWorked = ref(20);
const notes = ref([
  { id: 1, text: 'Reviewed timesheet for accuracy.' },
  { id: 2, text: 'Approved one adjustment request.' }
]);

const exportReport = () => {
  // TODO: integrate with report export endpoint
  toast.info('Export started');
};
</script>

<style scoped>
.text-muted-foreground { color: rgba(107,114,128,1); }
</style>
