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
import { ref } from 'vue';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';

const approvals = ref([
  { id: 1, title: 'Time adjustment for Oct 3', by: 'Alice', date: '2025-10-03' },
  { id: 2, title: 'Overtime approval for Sep 28', by: 'Bob', date: '2025-09-28' }
]);

const approve = (item) => {
  // demo action
  alert(`Approved: ${item.title}`);
  approvals.value = approvals.value.filter(a => a.id !== item.id);
};

const reject = (item) => {
  alert(`Rejected: ${item.title}`);
  approvals.value = approvals.value.filter(a => a.id !== item.id);
};

const loadMore = () => {
  alert('Loading more approvals (demo)');
};
</script>

<style scoped>
.text-muted-foreground { color: rgba(107,114,128,1); }
</style>
