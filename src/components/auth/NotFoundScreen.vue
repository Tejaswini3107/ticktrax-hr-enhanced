<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md text-center space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-center">
          <div class="h-16 w-16 rounded-2xl bg-orange-500 flex items-center justify-center">
            <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-orange-600">404</h1>
        <h2 class="text-xl font-semibold">Page Not Found</h2>
        <p class="text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
      </div>

      <div class="space-y-4">
        <p class="text-sm text-muted-foreground">
          The URL may be mistyped or the page may have been moved.
        </p>
        
        <div class="flex flex-col gap-2">
          <button 
            @click="goHome"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
          
          <button 
            @click="goBack"
            class="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>

      <div class="text-xs text-muted-foreground">
        <p>Lost? Use the navigation menu to find what you need.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

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
</script>