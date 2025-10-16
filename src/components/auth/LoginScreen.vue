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

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
  error.value = "";
  const emailVal = (email.value || '').trim();
  const pwd = (password.value || '').trim();
  if (!emailVal || !pwd) {
    error.value = "Email and password are required";
    return;
  }
  isLoading.value = true;
  try {
    const result = await authManager.login(emailVal, pwd);
    if (result.success && result.user) {
      // Create user display name from available fields
      const firstName = result.user.first_name || '';
      const lastName = result.user.last_name || '';
      const username = result.user.username || '';
      const email = result.user.email || '';
      
      // Use first name + last name, fallback to username, then email
      let displayName = '';
      if (firstName && lastName) {
        displayName = `${firstName} ${lastName}`;
      } else if (username) {
        displayName = username;
      } else if (email) {
        displayName = email.split('@')[0]; // Use email prefix
      } else {
        displayName = 'User';
      }
      
      emit('login', displayName, result.user.role);
    } else {
      error.value = result.error || "Invalid email or password";
    }
  } catch (err) {
    console.error('Login error:', err);
    error.value = err?.message || "Invalid email or password";
  } finally {
    isLoading.value = false;
  }
};

const getFormValues = () => ({
  email: email.value,
  password: password.value
});

const clearForm = () => {
  email.value = "";
  password.value = "";
  error.value = "";
};

defineExpose({
  getFormValues,
  clearForm,
  email,
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log In</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="Enter your email address"
              v-model="email" 
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
