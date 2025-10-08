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
import { ref } from 'vue';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';

const alertItems = ref([
  { id: 1, title: 'Server CPU high', time: '10m ago', severity: 'High' },
  { id: 2, title: 'Approval pending: Bob', time: '1h ago', severity: 'Medium' }
]);

const refresh = () => {
  alert('Refreshing alerts (demo)');
};
</script>

<style scoped>
.text-muted-foreground { color: rgba(107,114,128,1); }
</style>
