<template>
  <div class="mobile-login min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
    <div class="w-full max-w-sm space-y-6">
      <!-- App Branding -->
      <div class="text-center space-y-4">
        <div class="flex items-center justify-center">
          <div class="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <Clock class="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 class="text-3xl font-bold tracking-tight">TICKTRAX</h1>
          <p class="text-muted-foreground mt-2">Mobile Time Tracking</p>
        </div>
      </div>

      <!-- Login Form -->
      <Card class="shadow-xl border-0">
        <CardContent class="space-y-6 p-6">
          <!-- Login Mode Toggle -->
          <div class="flex rounded-lg bg-muted p-1">
            <Button
              :variant="loginMode === 'email' ? 'default' : 'ghost'"
              size="sm"
              class="flex-1"
              @click="loginMode = 'email'"
            >
              Email
            </Button>
            <Button
              :variant="loginMode === 'username' ? 'default' : 'ghost'"
              size="sm"
              class="flex-1"
              @click="loginMode = 'username'"
            >
              Username
            </Button>
          </div>

          <!-- Email/Username Input -->
          <div class="space-y-2">
            <Label :for="loginMode">{{ loginMode === 'email' ? 'Email' : 'Username' }}</Label>
            <Input 
              :id="loginMode"
              :type="loginMode === 'email' ? 'email' : 'text'" 
              :placeholder="loginMode === 'email' ? 'your@email.com' : 'username'" 
              v-model="emailOrUsername"
              class="h-12 text-base"
              :inputmode="loginMode === 'email' ? 'email' : 'text'"
              autocomplete="username"
              @keydown.enter="handleLogin"
            />
          </div>

          <!-- Password Input -->
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <div class="relative">
              <Input 
                id="password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="Enter password" 
                v-model="password"
                class="h-12 text-base pr-12"
                autocomplete="current-password"
                @keydown.enter="handleLogin"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                class="absolute right-0 top-0 h-12 w-12"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-5 w-5" />
                <Eye v-else class="h-5 w-5" />
              </Button>
            </div>
          </div>

          <!-- Error Message -->
          <Alert v-if="error" variant="destructive" class="text-sm">
            <AlertTriangle class="h-4 w-4" />
            {{ error }}
          </Alert>

          <!-- Login Button -->
          <Button 
            class="w-full h-12 text-base font-semibold" 
            @click="handleLogin" 
            :disabled="isLoading || !emailOrUsername || !password"
          >
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </Button>

          <!-- Biometric Login (if available) -->
          <div v-if="biometricSupported" class="text-center">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              class="w-full mt-4 h-12"
              @click="handleBiometricLogin"
            >
              <Fingerprint class="mr-2 h-5 w-5" />
              Use Biometric Login
            </Button>
          </div>

          <!-- Forgot Password -->
          <div class="text-center">
            <Button variant="link" class="text-sm text-muted-foreground">
              Forgot password?
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Demo Accounts -->
      <Card class="shadow-lg border-0">
        <CardContent class="p-4">
          <div class="flex items-center gap-2 mb-3">
            <Shield class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">Demo Accounts</span>
          </div>
          
          <div class="grid gap-2">
            <Button
              v-for="account in demoAccounts"
              :key="account.email"
              variant="outline"
              size="sm"
              class="justify-start h-auto p-3"
              @click="handleDemoLogin(account)"
            >
              <div class="flex items-center justify-between w-full">
                <div class="text-left">
                  <div class="font-medium text-sm">{{ account.name }}</div>
                  <div class="text-xs text-muted-foreground">{{ account.username }}</div>
                </div>
                <Badge :variant="account.role === 'admin' ? 'default' : 'secondary'" class="text-xs">
                  {{ account.role }}
                </Badge>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Network Status -->
      <div class="text-center">
        <div class="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <div :class="[
            'w-2 h-2 rounded-full',
            networkStatus === 'online' ? 'bg-green-500' : 
            networkStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
          ]" />
          <span>
            {{ networkStatus === 'online' ? 'Connected' : 
               networkStatus === 'offline' ? 'Offline Mode' : 'Connecting...' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import Input from '../ui/input.vue';
import Label from '../ui/label.vue';
import Badge from '../ui/badge.vue';
import Alert from '../ui/alert.vue';
import { 
  Clock, Shield, Eye, EyeOff, Loader2, AlertTriangle, 
  Fingerprint, Wifi, WifiOff 
} from 'lucide-vue-next';
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
const isLoading = ref(false);
const loginMode = ref("email");
const networkStatus = ref("online");
const biometricSupported = ref(false);

// Check for biometric support
onMounted(async () => {
  // Check if we're in a mobile environment with biometric capabilities
  if ('PublicKeyCredential' in window && 'authenticatorAttachment' in PublicKeyCredential.prototype) {
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      biometricSupported.value = available;
    } catch (err) {
      biometricSupported.value = false;
    }
  }

  // Monitor network status
  const updateNetworkStatus = () => {
    networkStatus.value = navigator.onLine ? 'online' : 'offline';
  };

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  updateNetworkStatus();
});

const handleLogin = async () => {
  if (!emailOrUsername.value || !password.value) {
    error.value = "Please enter both email/username and password";
    return;
  }

  error.value = "";
  isLoading.value = true;
  
  try {
    const result = await authManager.login(emailOrUsername.value, password.value);
    
    if (result.success) {
      // Store credentials for biometric login if supported
      if (biometricSupported.value) {
        localStorage.setItem('last_login_user', emailOrUsername.value);
      }
      // Normalize user display name across mock and real API shapes
      let displayName = '';
      const user = result.user || result.data || {};

      if (user.first_name || user.last_name) {
        displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      } else if (user.name) {
        displayName = user.name;
      } else if (user.email) {
        displayName = user.email;
      } else {
        displayName = emailOrUsername.value;
      }

      const role = user.role || (result.role || 'employee');

      emit('login', displayName, role);
    } else {
      error.value = result.error || "Invalid credentials";
    }
  } catch (err) {
    if (networkStatus.value === 'offline') {
      error.value = "No network connection. Please check your internet and try again.";
    } else {
      error.value = "Login failed. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleDemoLogin = async (account) => {
  emailOrUsername.value = account.username;
  password.value = account.password;
  await handleLogin();
};

const handleBiometricLogin = async () => {
  if (!biometricSupported.value) return;
  
  try {
    isLoading.value = true;
    
    // This would integrate with actual biometric authentication
    // For demo purposes, we'll use the last logged in user
    const lastUser = localStorage.getItem('last_login_user');
    if (lastUser) {
      const account = demoAccounts.find(acc => 
        acc.email === lastUser || acc.username === lastUser
      );
      if (account) {
        emit('login', account.name, account.role);
      }
    }
  } catch (err) {
    error.value = "Biometric authentication failed";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.mobile-login {
  /* Ensure full height on mobile */
  min-height: 100vh;
  min-height: 100dvh;
  
  /* Safe areas for notched devices */
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}

/* Touch-friendly input styling */
@media (max-width: 768px) {
  input[type="email"],
  input[type="text"],
  input[type="password"] {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
</style>
