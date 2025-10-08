<template>
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-4">Employee Management</h2>

    <div class="grid gap-3">
      <Card v-for="emp in employees" :key="emp.id" class="p-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">{{ emp.name }}</div>
            <div class="text-sm text-muted-foreground">{{ emp.role }}</div>
          </div>
          <div class="flex gap-2">
            <Button size="sm" @click="viewProfile(emp)">Profile</Button>
            <Button size="sm" variant="ghost" @click="toggleActive(emp)">{{ emp.active ? 'Deactivate' : 'Activate' }}</Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
console.debug('[EmployeeManagement] module loaded');
import { ref, onMounted } from 'vue';
import Card from '../ui/card.vue';
import Button from '../ui/button.vue';

const employees = ref([
  { id: 1, name: 'Ava Johnson', role: 'Engineer', active: true },
  { id: 2, name: 'Liam Smith', role: 'Designer', active: true },
  { id: 3, name: 'Olivia Brown', role: 'Product', active: false },
]);

const viewProfile = (emp) => {
  console.debug('[EmployeeManagement] viewProfile ->', emp.id);
  alert(`Open profile for ${emp.name}`);
};

const toggleActive = (emp) => {
  emp.active = !emp.active;
  console.debug('[EmployeeManagement] toggleActive ->', emp.id, emp.active);
};

onMounted(() => {
  console.debug('[EmployeeManagement] mounted');
});
</script>

<style scoped>
/* small layout niceties */
</style>
