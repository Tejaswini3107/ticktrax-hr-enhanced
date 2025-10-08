<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, DialogHeader, DialogTitle } from "../ui/dialog.vue";
import DialogContent from "../ui/dialog-template.vue";
import Button from "../ui/button.vue";
import Input from "../ui/input.vue";
import Label from "../ui/label.vue";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.vue";
import Card from "../ui/card.vue";
import { CardContent, CardHeader, CardTitle } from "../ui/card-components.vue";
import { UserPlus, Shield } from "lucide-vue-next";
import { toast } from 'vue-sonner';

type UserRole = "employee" | "manager" | "admin";

type UserData = {
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: UserRole;
  employeeType: string;
  startDate: string;
  manager?: string;
  notes?: string;
  permissions?: string[];
};

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['update:open', 'save']);

const initialUserData: UserData = {
  name: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  role: "employee",
  employeeType: "Regular",
  startDate: new Date().toISOString().split("T")[0],
  manager: "",
  notes: "",
  permissions: [],
};

const userData = ref<UserData>({ ...initialUserData });
const selectedPermissions = ref<Set<string>>(new Set());

const departments = ["Production", "Warehouse", "Field Service", "Quality Control", "HR", "Administration", "IT", "Finance"];
const employeeTypes = ["Regular", "Field Worker", "Warehouse", "Part-time", "Contractor"];
const managers = ["John Smith", "Sarah Johnson", "Mike Davis", "Emily Brown"];

const availablePermissions = [
  { id: "view_reports", label: "View Reports", description: "Access to view system reports" },
  { id: "manage_employees", label: "Manage Employees", description: "Add, edit, and remove employees" },
  { id: "approve_timesheets", label: "Approve Timesheets", description: "Approve team timesheets" },
  { id: "export_data", label: "Export Data", description: "Export system data" },
  { id: "system_settings", label: "System Settings", description: "Access system configuration" },
  { id: "user_management", label: "User Management", description: "Manage user accounts and roles" },
];

const handlePermissionToggle = (permissionId: string) => {
  const newPermissions = new Set(selectedPermissions.value);
  if (newPermissions.has(permissionId)) {
    newPermissions.delete(permissionId);
  } else {
    newPermissions.add(permissionId);
  }
  selectedPermissions.value = newPermissions;
  userData.value.permissions = Array.from(newPermissions);
};

const handleSave = () => {
  if (!userData.value.name || !userData.value.email || !userData.value.department) {
    toast.error("Please fill in all required fields.");
    return;
  }
  if (!userData.value.email.includes("@")) {
    toast.error("Please enter a valid email address.");
    return;
  }
  emit('save', userData.value);
  handleClose();
};

const handleClose = () => {
  userData.value = { ...initialUserData };
  selectedPermissions.value = new Set();
  emit('update:open', false);
};

const handleRoleChange = (role: UserRole) => {
  userData.value.role = role;
  let defaultPermissions: string[] = [];
  if (role === 'manager') {
    defaultPermissions = ["view_reports", "approve_timesheets"];
  } else if (role === 'admin') {
    defaultPermissions = availablePermissions.map(p => p.id);
  }
  selectedPermissions.value = new Set(defaultPermissions);
  userData.value.permissions = defaultPermissions;
};
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <UserPlus class="h-5 w-5" />
          Add New Employee
        </DialogTitle>
      </DialogHeader>

      <Tabs default-value="basic" class="flex-1 overflow-hidden flex flex-col">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="role">Role & Access</TabsTrigger>
        </TabsList>

        <div class="flex-1 overflow-auto p-4">
          <TabsContent value="basic" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="name">Full Name *</Label>
                <Input id="name" v-model="userData.name" placeholder="Enter full name" />
              </div>
              <div class="space-y-2">
                <Label for="email">Email *</Label>
                <Input id="email" type="email" v-model="userData.email" placeholder="user@xxx.com" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="phone">Phone Number</Label>
                <Input id="phone" v-model="userData.phone" placeholder="+33 (0)000000000" />
              </div>
              <div class="space-y-2">
                <Label for="startDate">Start Date</Label>
                <Input id="startDate" type="date" v-model="userData.startDate" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="department">Department *</Label>
                <Select v-model="userData.department">
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2">
                <Label for="position">Position</Label>
                <Input id="position" v-model="userData.position" placeholder="Job title" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="employeeType">Employee Type</Label>
                <Select v-model="userData.employeeType">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="type in employeeTypes" :key="type" :value="type">{{ type }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2">
                <Label for="manager">Manager</Label>
                <Select v-model="userData.manager">
                  <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="manager in managers" :key="manager" :value="manager">{{ manager }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="role" class="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Shield class="h-5 w-5" />
                  User Role & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="space-y-2">
                  <Label for="role">User Role</Label>
                  <Select :model-value="userData.role" @update:model-value="handleRoleChange">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-3">
                  <Label>Permissions</Label>
                  <div class="grid grid-cols-1 gap-3">
                    <div v-for="permission in availablePermissions" :key="permission.id" class="flex items-start space-x-3 p-3 border rounded-lg">
                      <input type="checkbox" :id="permission.id" :checked="selectedPermissions.has(permission.id)" @change="handlePermissionToggle(permission.id)" class="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                      <div class="flex-1">
                        <label :for="permission.id" class="font-medium cursor-pointer">{{ permission.label }}</label>
                        <p class="text-sm text-muted-foreground">{{ permission.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <div class="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" @click="handleClose">Cancel</Button>
        <Button @click="handleSave" class="gap-2">
          <UserPlus class="h-4 w-4" />
          Create User
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
