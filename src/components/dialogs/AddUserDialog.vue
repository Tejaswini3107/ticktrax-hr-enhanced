<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Dialog, DialogHeader, DialogTitle } from "../ui/dialog.vue";
import DialogContent from "../ui/dialog-template.vue";
import Button from "../ui/button.vue";
import Input from "../ui/input.vue";
import Label from "../ui/label.vue";
import { UserPlus } from "lucide-vue-next";
import { toast } from 'vue-sonner';
import apiService from '../../services/apiService.js';

type UserRole = "employee" | "manager" | "admin";

type UserData = {
  first_name?: string;
  last_name?: string;
  personal_email?: string;
  phone_number?: string;
  role?: UserRole | number;
};

const props = defineProps<{
  open: boolean;
  // optional: when provided in edit mode, dialog will prefill fields
  mode?: 'add' | 'edit';
  user?: any;
}>();

const emit = defineEmits(['update:open', 'save']);

const initialUserData: UserData = {
  first_name: "",
  last_name: "",
  personal_email: "",
  phone_number: "",
  role: "employee",
};

const userData = ref<UserData>({ ...initialUserData });

// no permission toggles in simplified dialog

const handleSave = async () => {
  // Validate required fields for the API
  if (!userData.value.first_name || !userData.value.last_name || !userData.value.personal_email) {
    toast.error("Please fill in all required fields (first name, last name, email).");
    return;
  }
  if (!userData.value.personal_email.includes("@")) {
    toast.error("Please enter a valid email address.");
    return;
  }

  const payload = {
    first_name: userData.value.first_name,
    last_name: userData.value.last_name,
    personal_email: userData.value.personal_email,
    role_id: typeof userData.value.role === 'number' ? userData.value.role : (userData.value.role === 'manager' ? 2 : 1),
    phone_number: userData.value.phone_number || '',
  };

  try {
    let res;
    if (props.mode === 'edit' && props.user && (props.user.id || props.user.user_id)) {
      const uid = props.user.id || props.user.user_id;
      res = await apiService.updateUser(uid, payload);
    } else {
      res = await apiService.createUser(payload);
    }
    // Normalise potential response shapes
    const created = Array.isArray(res) ? res[0] : (res?.data || res?.user || res || {});
    toast.success(props.mode === 'edit' ? 'User updated successfully' : 'User created successfully');
    emit('save', created);
    handleClose();
  } catch (err) {
    console.error('Create/Update user failed', err);
    const msg = err?.response?.message || err?.message || 'Failed to create/update user';
    toast.error(msg.toString());
  }
};

const handleClose = () => {
  userData.value = { ...initialUserData };
  emit('update:open', false);
};

// Watch for open + user prop to prefill form when editing
watch(() => props.open, (val) => {
  if (val && props.mode === 'edit' && props.user) {
    // Prefill userData from various shapes
    const src = props.user?.data || props.user?.attributes || props.user || {};
    userData.value.first_name = src.first_name || src.firstName || src.name?.split?.(' ')?.[0] || '';
    userData.value.last_name = src.last_name || src.lastName || src.name?.split?.(' ')?.slice(1).join(' ') || '';
    userData.value.personal_email = src.personal_email || src.email || '';
    userData.value.phone_number = src.phone_number || src.phone || '';
    userData.value.role = src.role || src.role_id || userData.value.role;
  }
});

const handleRoleChange = (role: UserRole) => { userData.value.role = role; };

const isEdit = computed(() => props.mode === 'edit');
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <UserPlus class="h-5 w-5" />
          {{ isEdit ? 'Edit Employee' : 'Add New Employee' }}
        </DialogTitle>
      </DialogHeader>

      <div class="p-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="firstName">First Name *</Label>
            <Input id="firstName" v-model="userData.first_name" placeholder="First name" />
          </div>
          <div class="space-y-2">
            <Label for="lastName">Last Name *</Label>
            <Input id="lastName" v-model="userData.last_name" placeholder="Last name" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div class="space-y-2">
            <Label for="email">Email *</Label>
            <Input id="email" type="email" v-model="userData.personal_email" placeholder="user@domain.com" />
          </div>
          <div class="space-y-2">
            <Label for="phone">Phone Number</Label>
            <Input id="phone" v-model="userData.phone_number" placeholder="+33 (0)000000000" />
          </div>
        </div>
        <div class="mt-4 space-y-2">
          <Label for="role">User Role</Label>
          <select id="role" class="w-full px-3 py-2 bg-input-background border border-border rounded-lg" v-model="userData.role">
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" @click="handleClose">Cancel</Button>
        <Button @click="handleSave" class="gap-2">
          <UserPlus class="h-4 w-4" />
          {{ isEdit ? 'Save Changes' : 'Create User' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
