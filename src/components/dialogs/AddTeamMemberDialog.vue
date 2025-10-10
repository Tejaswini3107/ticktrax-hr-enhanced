<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Dialog, DialogHeader, DialogTitle } from "../ui/dialog.vue";
import DialogContent from "../ui/dialog-template.vue";
import Button from "../ui/button.vue";
import Input from "../ui/input.vue";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.vue";
import Badge from "../ui/badge.vue";
import { Search, UserPlus, MapPin } from "lucide-vue-next";
import { toast } from 'vue-sonner';
import apiService from '../../services/apiService.js';
import authManager from '../../services/authService.js';
import { API_CONFIG } from '../../config/api.js';

type Employee = {
  id: string;
  name: string;
  department: string;
  role: string;
  status: string;
  type: string;
  currentTeam?: string;
};

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['update:open', 'add']);

const searchQuery = ref("");
const selectedEmployees = ref<Set<string>>(new Set());
const availableEmployees = ref<Employee[]>([]);
const loading = ref(false);
const teamId = ref<string | null>(null);
const teamName = ref('Unassigned');

const filteredEmployees = computed(() =>
  availableEmployees.value.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

const loadAvailableEmployees = async () => {
  try {
    const cur = await authManager.getCurrentUser();
    if (!cur.success) {
      toast.error('You must be signed in to manage team members.');
      return;
    }
    const user = cur.data || {};
    teamId.value = user.team_id || user.attributes?.team_id || null;
    teamName.value = user.team_name || user.attributes?.team_name || (teamId.value ? `Team ${teamId.value}` : 'Unassigned');

    const users = await apiService.listUsers();
    const normalized = (Array.isArray(users) ? users : []).map((u: any) => {
      const attrs = u.attributes || {};
      return {
        id: u.id || attrs.id || String(u.id || attrs.email || ''),
        name: attrs.first_name ? `${attrs.first_name} ${attrs.last_name}` : (u.name || u.email || 'Unknown'),
        department: attrs.department || u.department || 'Unknown',
        role: (attrs.role || u.role || 'employee'),
        status: attrs.status || u.status || 'active',
        type: attrs.type || 'Regular',
        currentTeam: attrs.team_name || u.team_name || (attrs.team_id ? `Team ${attrs.team_id}` : (u.team_id ? `Team ${u.team_id}` : 'Unassigned'))
      } as Employee;
    });
    availableEmployees.value = normalized;
  } catch (e) {
    console.error('Failed to load employees', e);
    toast.error('Unable to load employees from server.');
  }
};

// Load when dialog opens
watch(() => props.open, (v) => { if (v) loadAvailableEmployees(); });

const handleSelectEmployee = (employeeId: string) => {
  const newSelected = new Set(selectedEmployees.value);
  if (newSelected.has(employeeId)) {
    newSelected.delete(employeeId);
  } else {
    newSelected.add(employeeId);
  }
  selectedEmployees.value = newSelected;
};

const handleAddSelected = async () => {
  const selectedEmployeesList = availableEmployees.value.filter(emp => selectedEmployees.value.has(emp.id));
  if (selectedEmployeesList.length === 0) {
    toast.error("Please select at least one employee to add to your team.");
    return;
  }

  if (!teamId.value) {
    toast.error('Your account is not assigned to a team. Cannot add members.');
    return;
  }

  loading.value = true;
  try {
    const endpointTemplate = API_CONFIG.ENDPOINTS.USERS.BY_ID; // '/users/:id'
    const promises = selectedEmployeesList.map(emp => {
      const endpoint = endpointTemplate.replace(':id', String(emp.id));
      // Update user with team_id; backend may expect { user: { team_id } } or { team_id }
      // We send { user: { team_id } } which is compatible with common Rails-style APIs.
      return apiService.request(endpoint, { method: 'PUT', body: JSON.stringify({ user: { team_id: teamId.value } }) })
        .then(res => ({ success: true, emp, res }))
        .catch(err => ({ success: false, emp, err }));
    });

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    if (successCount > 0) {
      toast.success(`Added ${successCount} employee${successCount > 1 ? 's' : ''} to ${teamName.value}`);
      results.filter(r => r.success).forEach(r => emit('add', r.emp));
      handleClose();
    } else {
      toast.error('Failed to add selected employees.');
    }
  } catch (e) {
    console.error('Add members failed', e);
    toast.error('An error occurred while adding members.');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  selectedEmployees.value = new Set();
  searchQuery.value = "";
  emit('update:open', false);
};
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <UserPlus class="h-5 w-5" />
          Add Team Members
        </DialogTitle>
      </DialogHeader>

      <div class="space-y-4 flex-1 overflow-hidden flex flex-col">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search employees by name, department, or ID..." v-model="searchQuery" class="pl-10" />
        </div>

        <div class="flex-1 overflow-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">Select</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Current Team</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="employee in filteredEmployees" :key="employee.id">
                <TableCell>
                  <input type="checkbox" :checked="selectedEmployees.has(employee.id)" @change="handleSelectEmployee(employee.id)" class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                </TableCell>
                <TableCell>
                  <div>
                    <p class="font-medium">{{ employee.name }}</p>
                    <p class="text-sm text-muted-foreground">{{ employee.id }}</p>
                  </div>
                </TableCell>
                <TableCell>{{ employee.department }}</TableCell>
                <TableCell>
                  <div class="flex items-center gap-1">
                    <MapPin v-if="employee.type === 'Field Worker'" class="h-3 w-3 text-blue-500" />
                    {{ employee.type }}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="employee.currentTeam === 'Unassigned' ? 'outline' : 'secondary'">{{ employee.currentTeam }}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="default" class="bg-green-500 hover:bg-green-600">{{ employee.status }}</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div v-if="filteredEmployees.length === 0" class="text-center py-8 text-muted-foreground">
          <UserPlus class="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No employees found matching your search.</p>
        </div>

        <div v-if="selectedEmployees.size > 0" class="text-sm text-muted-foreground">
          {{ selectedEmployees.size }} employee{{ selectedEmployees.size > 1 ? "s" : "" }} selected
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" @click="handleClose">Cancel</Button>
        <Button @click="handleAddSelected" :disabled="selectedEmployees.size === 0" class="gap-2">
          <UserPlus class="h-4 w-4" />
          Add Selected ({{ selectedEmployees.size }})
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
