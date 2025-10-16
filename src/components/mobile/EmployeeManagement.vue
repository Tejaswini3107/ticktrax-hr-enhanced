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
import apiService from '../../services/apiService.js';
import { toast } from 'vue-sonner';
import { API_CONFIG } from '../../config/api.js';

const employees = ref([]);
const loading = ref(false);

const normalizeUser = (u) => {
  const attrs = u.attributes || {};
  return {
    id: u.id || attrs.id,
    name: attrs.first_name ? `${attrs.first_name} ${attrs.last_name}` : (u.name || u.email || 'Unknown'),
    role: (attrs.role || u.role || 'employee'),
    active: ((attrs.status || u.status || 'active').toLowerCase() === 'active')
  };
};

const loadEmployees = async () => {
  loading.value = true;
  try {
    const users = await apiService.listUsers();
    const userArray = Array.isArray(users) ? users : (users?.data || []);
    employees.value = userArray.map(normalizeUser);
  } catch (e) {
    console.error('Failed to load employees', e);
    toast.error('Unable to load employees');
  } finally {
    loading.value = false;
  }
};

const viewProfile = async (emp) => {
  try {
    const detail = await apiService.getUserById(emp.id);
    // Show a simple profile preview; replace with a proper modal if available
    alert(`Profile: ${emp.name}\nRole: ${emp.role}\n${JSON.stringify(detail, null, 2)}`);
  } catch (e) {
    console.error('Failed to load profile', e);
    toast.error('Unable to load profile');
  }
};

const toggleActive = async (emp) => {
  const newStatus = emp.active ? 'inactive' : 'active';
  const endpoint = API_CONFIG.ENDPOINTS.USERS.BY_ID.replace(':id', String(emp.id));
  try {
    await apiService.request(endpoint, { method: 'PUT', body: JSON.stringify({ user: { status: newStatus } }) });
    emp.active = !emp.active;
    toast.success(`${emp.name} is now ${emp.active ? 'active' : 'inactive'}`);
  } catch (e) {
    console.error('Failed to update user status', e);
    toast.error('Unable to update user status');
  }
};

onMounted(() => {
  loadEmployees();
});
</script>

<style scoped>
/* small layout niceties */
</style>
