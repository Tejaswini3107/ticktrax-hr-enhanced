<script setup>
import { ref } from 'vue';
import Card from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import Input from '../ui/input.vue';
import Label from '../ui/label.vue';
import Alert from '../ui/alert.vue';
import authManager from '../../services/authService.js';

const emit = defineEmits(['login']);

const emailOrUsername = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
  error.value = "";
  const email = (emailOrUsername.value || '').trim();
  const pwd = (password.value || '').trim();
  if (!email || !pwd) {
    error.value = "Email and password are required";
    return;
  }
  isLoading.value = true;
  
  try {
    // Demo login system - bypass real API for development
    if (pwd === 'demo123') {
      // Determine role based on email
      let role = 'employee';
      let name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      if (email.includes('manager')) {
        role = 'manager';
        name = 'Manager User';
      } else if (email.includes('hr')) {
        role = 'hr';
        name = 'HR User';
      } else if (email.includes('admin')) {
        role = 'admin';
        name = 'Admin User';
      } else {
        name = 'Employee User';
      }
      
      emit('login', name, role);
    } else {
      error.value = "Use password 'demo123' for demo access";
    }
  } catch (err) {
    error.value = err?.message || "Login failed";
  } finally {
    isLoading.value = false;
  }
};

const getFormValues = () => ({
  emailOrUsername: emailOrUsername.value,
  password: password.value
});

const clearForm = () => {
  emailOrUsername.value = "";
  password.value = "";
  error.value = "";
};

defineExpose({
  getFormValues,
  clearForm,
  emailOrUsername,
  password
});
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center space-y-2">
        <div class="flex items-center justify-center gap-2 mb-4">
          <div class="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <span class="h-6 w-6 text-primary-foreground">⏰</span>
          </div>
        </div>
        <h1>TICKTRAX</h1>
        <p class="text-muted-foreground">Time Tracking System</p>
        <div class="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          <strong>Demo Mode:</strong> Use any email + password "demo123"<br>
          Try: hr@demo.com, manager@demo.com, admin@demo.com
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log In</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="emailOrUsername">Email Address</Label>
            <Input 
              id="emailOrUsername" 
              type="email"
              placeholder="Enter your email address"
              v-model="emailOrUsername" 
              @keydown.enter="handleLogin" 
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <div class="relative">
              <Input id="password" :type="showPassword ? 'text' : 'password'" placeholder="Enter your password" v-model="password" @keydown.enter="handleLogin" />
              <Button type="button" variant="ghost" size="sm" class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" @click="showPassword = !showPassword">
                <span class="h-4 w-4">👁</span>
              </Button>
            </div>
          </div>

          <Alert v-if="error" variant="destructive">
            {{ error }}
          </Alert>

          <Button class="w-full" @click="handleLogin" :disabled="isLoading">
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
