<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md text-center space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-center">
          <div class="h-16 w-16 rounded-2xl bg-red-500 flex items-center justify-center">
            <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-red-600">403</h1>
        <h2 class="text-xl font-semibold">Access Denied</h2>
        <p class="text-muted-foreground">
          You don't have permission to access this resource.
        </p>
      </div>

      <div class="space-y-4">
        <p class="text-sm text-muted-foreground">
          This page requires higher privileges than your current role allows.
        </p>
        
        <div class="flex flex-col gap-2">
          <button 
            @click="goBack"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
          
          <button 
            @click="goHome"
            class="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Return to Dashboard
          </button>
          
          <button 
            @click="logout"
            class="px-4 py-2 text-red-600 hover:text-red-700 transition-colors text-sm"
          >
            Logout & Switch User
          </button>
        </div>
      </div>

      <div class="text-xs text-muted-foreground">
        <p>Need higher access? Contact your administrator.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import authManager from '../../services/authService.js'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/dashboard')
  }
}

const goHome = () => {
  router.push('/dashboard')
}

const logout = async () => {
  await authManager.logout()
  router.push('/login')
}
</script>