<template>
  <div class="profile-modal fixed inset-0 z-60 flex items-center justify-center">
    <div class="bg-background p-4 rounded-lg shadow-lg w-11/12 max-w-md">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold">Profile</h3>
        <Button variant="ghost" size="sm" @click="$emit('close')">
          <X class="h-4 w-4" />
        </Button>
      </div>

      <div class="space-y-2">
        <div class="text-sm text-muted-foreground">Name</div>
        <div class="font-medium">{{ user?.first_name }} {{ user?.last_name }}</div>

        <div class="text-sm text-muted-foreground mt-2">Email</div>
        <div class="font-medium">{{ user?.email || '—' }}</div>

        <div class="text-sm text-muted-foreground mt-2">Role</div>
        <div class="font-medium">{{ user?.role || 'employee' }}</div>
      </div>

      <div class="mt-4 flex gap-2">
        <Button variant="outline" class="flex-1" @click="$emit('logout')">Logout</Button>
        <Button class="flex-1" @click="$emit('close')">Close</Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from '../ui/button.vue';
import { X } from 'lucide-vue-next';
const props = defineProps({ user: Object });
const emit = defineEmits(['close', 'logout']);
</script>

<style scoped>
.profile-modal { background: rgba(0,0,0,0.4); }
</style>
