<script setup>
import { ref, computed } from 'vue';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.vue';
import DialogContent from '../ui/dialog-template.vue';
import Button from '../ui/button.vue';
import Input from '../ui/input.vue';
import Label from '../ui/label.vue';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs.vue';
import Card from '../ui/card.vue';
import {
  CardHeader,
  CardContent,
  CardTitle,
} from '../ui/card-components.vue';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.vue';
import Badge from '../ui/badge.vue';
import { Separator } from '../ui/separator.vue';
import { Switch } from '../ui/switch.vue';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-vue-next';
import { useToast } from '../ui/toast/use-toast.js';

const props = defineProps({
  open: Boolean,
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:open']);

const { toast } = useToast();

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const isEditing = ref(false);

const profileData = ref({
  name: props.user.name,
  email: props.user.email || 'john.doe@company.com',
  phone: props.user.phone || '+1 (555) 123-4567',
  department: props.user.department || 'Engineering',
  location: props.user.location || 'New York, NY',
  startDate: props.user.startDate || '2023-01-15',
  employeeId: props.user.employeeId || 'EMP001',
});

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const handleSaveProfile = () => {
  toast({
    title: 'Success',
    description: 'Profile updated successfully!',
  });
  isEditing.value = false;
};

const handleChangePassword = () => {
  if (
    passwordData.value.newPassword !==
    passwordData.value.confirmPassword
  ) {
    toast({
      title: 'Error',
      description: "New passwords don't match!",
      variant: 'destructive',
    });
    return;
  }
  if (passwordData.value.newPassword.length < 6) {
    toast({
      title: 'Error',
      description: 'Password must be at least 6 characters!',
      variant: 'destructive',
    });
    return;
  }
  toast({
    title: 'Success',
    description: 'Password changed successfully!',
  });
  passwordData.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
};

const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-red-500 hover:bg-red-600';
    case 'manager':
      return 'bg-blue-500 hover:bg-blue-600';
    default:
      return 'bg-green-500 hover:bg-green-600';
  }
};

const avatarFallback = computed(() =>
  profileData.value.name
    .split(' ')
    .map((n) => n[0])
    .join('')
);
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Profile Settings</DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="profile" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" class="space-y-6">
          <Card>
            <CardHeader>
              <div class="flex items-center space-x-4">
                <Avatar class="h-20 w-20">
                  <AvatarImage src="" :alt="profileData.name" />
                  <AvatarFallback class="text-lg">
                    {{ avatarFallback }}
                  </AvatarFallback>
                </Avatar>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <h3>{{ profileData.name }}</h3>
                    <Badge :class="getRoleBadgeColor(user.role)">
                      {{
                        user.role.charAt(0).toUpperCase() +
                        user.role.slice(1)
                      }}
                    </Badge>
                  </div>
                  <p class="text-muted-foreground">
                    Employee ID: {{ profileData.employeeId }}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="name">Full Name</Label>
                  <div class="relative">
                    <User
                      class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                      id="name"
                      v-model="profileData.name"
                      :disabled="!isEditing"
                      class="pl-10"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label for="email">Email</Label>
                  <div class="relative">
                    <Mail
                      class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                      id="email"
                      type="email"
                      v-model="profileData.email"
                      :disabled="!isEditing"
                      class="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="phone">Phone</Label>
                  <div class="relative">
                    <Phone
                      class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                      id="phone"
                      v-model="profileData.phone"
                      :disabled="!isEditing"
                      class="pl-10"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label for="department">Department</Label>
                  <div class="relative">
                    <Building
                      class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                      id="department"
                      v-model="profileData.department"
                      :disabled="!isEditing"
                      class="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="location">Location</Label>
                  <div class="relative">
                    <MapPin
                      class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                      id="location"
                      v-model="profileData.location"
                      :disabled="!isEditing"
                      class="pl-10"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label for="startDate">Start Date</Label>
                  <div class="relative">
                    <Calendar
                      class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                      id="startDate"
                      type="date"
                      v-model="profileData.startDate"
                      disabled
                      class="pl-10"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div class="flex justify-end gap-2">
                <template v-if="isEditing">
                  <Button variant="outline" @click="isEditing = false">
                    Cancel
                  </Button>
                  <Button @click="handleSaveProfile">Save Changes</Button>
                </template>
                <template v-else>
                  <Button @click="isEditing = true">Edit Profile</Button>
                </template>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Shield class="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label for="currentPassword">Current Password</Label>
                <div class="relative">
                  <Input
                    id="currentPassword"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    v-model="passwordData.currentPassword"
                    class="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <EyeOff v-if="showCurrentPassword" class="h-4 w-4" />
                    <Eye v-else class="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div class="space-y-2">
                <Label for="newPassword">New Password</Label>
                <div class="relative">
                  <Input
                    id="newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    v-model="passwordData.newPassword"
                    class="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    @click="showNewPassword = !showNewPassword"
                  >
                    <EyeOff v-if="showNewPassword" class="h-4 w-4" />
                    <Eye v-else class="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div class="space-y-2">
                <Label for="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  v-model="passwordData.confirmPassword"
                />
              </div>

              <Button @click="handleChangePassword" class="w-full">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p>Email Notifications</p>
                    <p class="text-sm text-muted-foreground">
                      Receive email updates about timesheet approvals
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <p>Clock Out Reminders</p>
                    <p class="text-sm text-muted-foreground">
                      Get reminded if you forget to clock out
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <p>Mobile Push Notifications</p>
                    <p class="text-sm text-muted-foreground">
                      Receive push notifications on mobile devices
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <Button class="w-full">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
