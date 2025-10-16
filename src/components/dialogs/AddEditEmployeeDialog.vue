<script setup lang="ts">
import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import apiService from '../../services/apiService.js';
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog.vue";
import DialogContent from "../ui/dialog-template.vue";
import Button from "../ui/button.vue";
import Input from "../ui/input.vue";
import Label from "../ui/label.vue";
import { UserPlus, Loader2 } from "lucide-vue-next";

type Employee = {
  id: string;
  name: string;
  role: string;
  status: string;
  hoursThisWeek: number;
  email?: string;
  phone?: string;
  // simplified: no type/location
};

const props = defineProps<{
  employee?: Employee | null;
  open: boolean;
}>();

const emit = defineEmits(['update:open', 'save']);

const isSubmitting = ref(false);
const isLoadingUser = ref(false);
const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'employee',
  // simplified: no type/location
});

// When the parent provides an employee with an id, fetch the authoritative record
// from the API to ensure we edit the latest server data. Otherwise fall back to
// the provided employee object (or empty form for add).
const ROLE_MAP = { 1: 'employee', 2: 'manager', 3: 'admin' };
const normalizeRole = (val) => {
  if (val == null) return 'employee';
  // numeric ids
  if (typeof val === 'number') return ROLE_MAP[val] || 'employee';
  if (typeof val === 'string') {
    const s = val.trim();
    const n = Number(s);
    if (!Number.isNaN(n)) return ROLE_MAP[n] || 'employee';
    // Normalize string roles case-insensitively
    const lower = s.toLowerCase();
    if (lower === 'admin' || lower === 'administrator') return 'admin';
    if (lower === 'manager' || lower === 'lead') return 'manager';
    if (lower === 'employee' || lower === 'staff' || lower === 'user') return 'employee';
    // If it's already one of our canonical keys, return it
    if (['admin', 'manager', 'employee'].includes(lower)) return lower;
    // Fallback: return original string to avoid losing data, but prefer employee
    return lower;
  }
  return 'employee';
};

const loadUser = async (userId) => {
  isLoadingUser.value = true;
  try {
    const res = await apiService.getUserById(userId);
    const src = Array.isArray(res) ? res[0] : (res?.data || res?.user || res || {});
    // map common shapes to our form fields
    const first = src.first_name || src.attributes?.first_name || '';
    const last = src.last_name || src.attributes?.last_name || '';
    const email = src.personal_email || src.email || src.attributes?.personal_email || src.attributes?.email || '';
    const phone = src.phone_number || src.phone || src.attributes?.phone || '';
  const rawRole = src.role || src.attributes?.role || src.role_id || src.attributes?.role_id || 'employee';
  const role = normalizeRole(rawRole);
    formData.value = {
      first_name: first,
      last_name: last,
      email: email,
      phone: phone,
      role: role,
    };
  } catch (err) {
    console.warn('Failed to load user for edit', err);
    toast.error('Failed to load user data from server.');
    // fall back to provided props.employee where possible
    const src = props.employee || {};
    const parts = String(src.name || '').trim().split(/\s+/);
    formData.value = {
      first_name: src.first_name || parts.shift() || '',
      last_name: src.last_name || parts.join(' ') || '',
      email: src.email || src.personal_email || '',
      phone: src.phone || '',
      role: normalizeRole(src.role || src.role_id || src.attributes?.role || src.attributes?.role_id || 'employee'),
    };
  } finally {
    isLoadingUser.value = false;
  }
};

watch(() => props.employee, (newEmployee) => {
  if (newEmployee && (newEmployee.id || newEmployee.user_id)) {
    // Use server data when editing an existing user
    const id = newEmployee.id || newEmployee.user_id;
    loadUser(id);
  } else {
    // New user or missing id — use provided object or reset
    const src = newEmployee || {};
    let first = '';
    let last = '';
    if (src.first_name || src.last_name) {
      first = src.first_name || '';
      last = src.last_name || '';
    } else if (src.name) {
      const parts = String(src.name).trim().split(/\s+/);
      first = parts.shift() || '';
      last = parts.join(' ') || '';
    }
    formData.value = {
      first_name: first,
      last_name: last,
      email: src.email || src.personal_email || "",
      phone: src.phone || "",
      role: normalizeRole(src.role || src.role_id || src.attributes?.role || src.attributes?.role_id || 'employee'),
    };
  }
}, { immediate: true });

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    // Build payload in the required API shape
    const payload = {
      first_name: (formData.value.first_name || '').toString(),
      last_name: (formData.value.last_name || '').toString(),
      personal_email: formData.value.email || '',
      role_id: typeof formData.value.role === 'number' ? formData.value.role : (formData.value.role === 'manager' ? 2 : (formData.value.role === 'admin' ? 3 : 1)),
      phone_number: formData.value.phone || ''
    };

    let res;
    if (props.employee && (props.employee.id)) {
      // update existing user
      res = await apiService.updateUser(props.employee.id, payload);
      toast.success('User updated successfully');
    } else {
      // create new user
      res = await apiService.createUser(payload);
      toast.success('User created successfully');
    }

    // Normalize server response
    const created = Array.isArray(res) ? res[0] : (res?.data || res?.user || res || {});

    // Emit the created/updated user to parent so lists update
    emit('save', created);
  } catch (err) {
    console.error('Failed creating/updating user from AddEditEmployeeDialog', err);
    const msg = err?.response?.message || err?.message || 'Failed to save user';
    toast.error(String(msg));
  } finally {
    isSubmitting.value = false;
    emit('update:open', false);
  }
};
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <UserPlus class="h-5 w-5" />
          {{ employee ? "Edit Employee" : "Add New Employee" }}
        </DialogTitle>
        <DialogDescription>
          {{ employee ? "Update employee information and settings" : "Add a new employee to the system" }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4>Personal Information</h4>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="firstName">First Name *</Label>
              <Input id="firstName" placeholder="First name" v-model="formData.first_name" required />
            </div>
            <div class="space-y-2">
              <Label for="lastName">Last Name *</Label>
              <Input id="lastName" placeholder="Last name" v-model="formData.last_name" required />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="email">Email Address *</Label>
              <Input id="email" type="email" placeholder="john.doe@company.com" v-model="formData.email" required />
            </div>
            <div class="space-y-2">
              <Label for="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="(555) 123-4567" v-model="formData.phone" />
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h4>Employment Details</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="role">Role *</Label>
              <select id="role" class="w-full px-3 py-2 bg-input-background border border-border rounded-lg" v-model="formData.role" required>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)" :disabled="isSubmitting">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting || isLoadingUser">
            <template v-if="isSubmitting || isLoadingUser">
              <Loader2 class="h-4 w-4 mr-2 animate-spin" />
              {{ isLoadingUser ? 'Loading...' : (employee ? 'Updating...' : 'Adding...') }}
            </template>
            <template v-else>
              {{ employee ? "Update Employee" : "Add Employee" }}
            </template>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
