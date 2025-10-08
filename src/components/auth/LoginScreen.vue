<script setup>
import { ref } from 'vue';
import Card from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import Input from '../ui/input.vue';
import Label from '../ui/label.vue';
import Badge from '../ui/badge.vue';
import { Clock, Shield, Eye, EyeOff } from 'lucide-vue-next';
import Alert from '../ui/alert.vue';
import authManager from '../../services/authService.js';

const emit = defineEmits(['login']);

const demoAccounts = [
  { email: "employee_user@example.com", username: "employee_user", password: "employee123", role: "employee", name: "Employee User" },
  { email: "manager_user@example.com", username: "manager_user", password: "manager123", role: "manager", name: "Manager User" },
  { email: "admin_user@example.com", username: "admin_user", password: "admin123", role: "admin", name: "Admin User" },
];

const emailOrUsername = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref("");
const selectedDemo = ref(null);
const isLoading = ref(false);
const loginMode = ref("email"); // "email" or "username"

const handleLogin = async () => {
  error.value = "";
  isLoading.value = true;
  
  try {
    // Try real authentication first
    const result = await authManager.login(emailOrUsername.value, password.value);
    
    if (result.success) {
      emit('login', `${result.user.first_name} ${result.user.last_name}`, result.user.role);
    } else {
      // Fallback to demo accounts for development
      const account = demoAccounts.find(acc => 
        (acc.email === emailOrUsername.value || acc.username === emailOrUsername.value) && 
        acc.password === password.value
      );
      if (account) {
        emit('login', account.name, account.role);
      } else {
        error.value = result.error || "Invalid email/username or password";
      }
    }
  } catch (err) {
    // Fallback to demo accounts for development
    const account = demoAccounts.find(acc => 
      (acc.email === emailOrUsername.value || acc.username === emailOrUsername.value) && 
      acc.password === password.value
    );
    if (account) {
      emit('login', account.name, account.role);
    } else {
      error.value = "Invalid email/username or password";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleDemoLogin = (account) => {
  emailOrUsername.value = account.email;
  password.value = account.password;
  selectedDemo.value = { ...account };
};

const handleQuickLogin = async () => {
  if (selectedDemo.value) {
    isLoading.value = true;
    try {
      // Try real authentication first
      const result = await authManager.login(selectedDemo.value.email, selectedDemo.value.password);
      
      if (result.success) {
        emit('login', `${result.user.first_name} ${result.user.last_name}`, result.user.role);
      } else {
        // Fallback to demo mode
        emit('login', selectedDemo.value.name, selectedDemo.value.role);
      }
    } catch (err) {
      // Fallback to demo mode
      emit('login', selectedDemo.value.name, selectedDemo.value.role);
    } finally {
      isLoading.value = false;
    }
  }
};

// Method to get current form values
const getFormValues = () => {
  return {
    emailOrUsername: emailOrUsername.value,
    password: password.value
  };
};

// Method to clear form
const clearForm = () => {
  emailOrUsername.value = "";
  password.value = "";
  error.value = "";
  selectedDemo.value = null;
};

// Expose methods for parent component access
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
            <Clock class="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <h1>TICKTRAX</h1>
        <p class="text-muted-foreground">Time Tracking System</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log In</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Label for="emailOrUsername">{{ loginMode === 'email' ? 'Email Address' : 'Username' }}</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                @click="loginMode = loginMode === 'email' ? 'username' : 'email'"
                class="text-xs"
              >
                Use {{ loginMode === 'email' ? 'Username' : 'Email' }}
              </Button>
            </div>
            <Input 
              id="emailOrUsername" 
              :type="loginMode === 'email' ? 'email' : 'text'" 
              :placeholder="loginMode === 'email' ? 'Enter your email address' : 'Enter your username'" 
              v-model="emailOrUsername" 
              @keydown.enter="handleLogin" 
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <div class="relative">
              <Input id="password" :type="showPassword ? 'text' : 'password'" placeholder="Enter your password" v-model="password" @keydown.enter="handleLogin" />
              <Button type="button" variant="ghost" size="sm" class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Alert v-if="error" variant="destructive">
            {{ error }}
          </Alert>

          <Button class="w-full" @click="handleLogin" :disabled="isLoading">
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </Button>

          <div class="text-center text-sm text-muted-foreground">
            <a href="#" class="hover:text-primary">Forgot password?</a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Shield class="h-4 w-4" />
            Demo Accounts
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <p class="text-sm text-muted-foreground mb-3">Click to auto-fill credentials, then sign in:</p>
          <div class="grid grid-cols-1 gap-2">
            <div v-for="account in demoAccounts" :key="account.email" :class="['p-3 rounded-lg border cursor-pointer transition-colors', { 'bg-primary/10 border-primary': selectedDemo?.email === account.email, 'hover:bg-accent': selectedDemo?.email !== account.email }]" @click="handleDemoLogin(account)">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium">{{ account.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ account.email }}</p>
                  <p class="text-xs text-muted-foreground">Username: {{ account.username }}</p>
                </div>
                <Badge :variant="account.role === 'admin' ? 'default' : 'secondary'">{{ account.role }}</Badge>
              </div>
            </div>
          </div>
          <Button v-if="selectedDemo" class="w-full mt-4" @click="handleQuickLogin" :disabled="isLoading">
            {{ isLoading ? 'Signing In...' : `Quick Login as ${selectedDemo.name}` }}
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
