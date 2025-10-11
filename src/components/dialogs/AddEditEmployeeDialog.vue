<script setup lang="ts">
import { ref, watch } from 'vue';
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog.vue";
import DialogContent from "../ui/dialog-template.vue";
import Button from "../ui/button.vue";
import Input from "../ui/input.vue";
import Label from "../ui/label.vue";
import { UserPlus, Loader2 } from "lucide-vue-next";

type Employee = {
  id: string;
  name: string;
  department: string;
  role: string;
  status: string;
  hoursThisWeek: number;
  type: string;
  email?: string;
  phone?: string;
  location?: string;
  hireDate?: string;
};

const props = defineProps<{
  employee?: Employee | null;
  open: boolean;
}>();

const emit = defineEmits(['update:open', 'save']);

const isSubmitting = ref(false);
const formData = ref({
  name: '',
  email: '',
  phone: '',
  department: '',
  role: 'employee',
  type: 'Regular',
  location: '',
  hireDate: '',
});

watch(() => props.employee, (newEmployee) => {
  formData.value = {
    name: newEmployee?.name || "",
    email: newEmployee?.email || "",
    phone: newEmployee?.phone || "",
    department: newEmployee?.department || "",
    role: newEmployee?.role || "employee",
    type: newEmployee?.type || "Regular",
    location: newEmployee?.location || "",
    hireDate: newEmployee?.hireDate || "",
  };
}, { immediate: true });

const handleSubmit = async () => {
  isSubmitting.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  emit('save', {
    ...formData.value,
    id: props.employee?.id || `EMP${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
    status: props.employee?.status || "active",
    hoursThisWeek: props.employee?.hoursThisWeek || 0,
  });
  isSubmitting.value = false;
  emit('update:open', false);
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
          <h4>Personal Information</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name">Full Name *</Label>
              <Input id="name" placeholder="John Doe" v-model="formData.name" required />
            </div>
            <div class="space-y-2">
              <Label for="email">Email Address *</Label>
              <Input id="email" type="email" placeholder="john.doe@company.com" v-model="formData.email" required />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="(555) 123-4567" v-model="formData.phone" />
            </div>
            <div class="space-y-2">
              <Label for="hireDate">Hire Date</Label>
              <Input id="hireDate" type="date" v-model="formData.hireDate" />
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h4>Employment Details</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="department">Department *</Label>
              <select id="department" class="w-full px-3 py-2 bg-input-background border border-border rounded-lg" v-model="formData.department" required>
                <option value="">Select Department</option>
                <option value="Production">Production</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Field Service">Field Service</option>
                <option value="Quality Control">Quality Control</option>
                <option value="HR">HR</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
            <div class="space-y-2">
              <Label for="role">Role *</Label>
              <select id="role" class="w-full px-3 py-2 bg-input-background border border-border rounded-lg" v-model="formData.role" required>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="type">Employee Type *</Label>
              <select id="type" class="w-full px-3 py-2 bg-input-background border border-border rounded-lg" v-model="formData.type" required>
                <option value="Regular">Regular</option>
                <option value="Field Worker">Field Worker</option>
                <option value="Warehouse">Warehouse</option>
              </select>
            </div>
            <div class="space-y-2">
              <Label for="location">Work Location</Label>
              <Input id="location" placeholder="Main Office" v-model="formData.location" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)" :disabled="isSubmitting">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <template v-if="isSubmitting">
              <Loader2 class="h-4 w-4 mr-2 animate-spin" />
              {{ employee ? "Updating..." : "Adding..." }}
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
