<template>
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-4">Settings</h2>

    <div class="grid gap-3">
      <Card class="p-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">Notifications</div>
            <div class="text-sm text-muted-foreground">Enable push notifications for important updates</div>
          </div>
          <input type="checkbox" v-model="notificationsEnabled" />
        </div>
      </Card>

      <Card class="p-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">Theme</div>
            <div class="text-sm text-muted-foreground">Switch between light and dark</div>
          </div>
          <select v-model="theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </Card>

      <Card class="p-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">Sign out of all devices</div>
            <div class="text-sm text-muted-foreground">Revoke active sessions</div>
          </div>
          <Button size="sm" variant="destructive" @click="signOutAll">Sign out</Button>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
console.debug('[Settings] module loaded');
import { ref, onMounted } from 'vue';
import authManager from '../../services/authService.js';
import toast from '../../utils/toast.js';
import Card from '../ui/card.vue';
import Button from '../ui/button.vue';

const notificationsEnabled = ref(true);
const theme = ref('system');

const signOutAll = async () => {
  console.debug('[Settings] signOutAll');
  try {
    const ok = await authManager.logout();
    if (ok) {
      toast.success('Signed out of all devices');
      // Optionally redirect or emit logout
      window.location.reload();
    } else {
      toast.error('Failed to sign out');
    }
  } catch (err) {
    console.error(err);
    toast.error('Sign out failed');
  }
};

onMounted(() => {
  console.debug('[Settings] mounted');
});
</script>

<style scoped>
</style>
