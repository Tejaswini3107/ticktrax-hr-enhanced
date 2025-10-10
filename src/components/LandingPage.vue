<template>
  <div class="landing-page p-8 max-w-4xl mx-auto text-center">
    <h1 class="text-3xl font-bold mb-4">Welcome to TickTrax</h1>
    <p class="text-gray-600 mb-6">Please sign in to access your dashboard, or explore the public demo.</p>
    <div class="flex justify-center gap-4">
      <router-link to="/login" class="btn btn-primary">Sign In</router-link>
      <router-link to="/unauthorized" class="btn btn-outline">Demo</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LandingPage'
}
</script>

<style scoped>
.landing-page { padding-top: 6rem; }
.btn { padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; }
.btn-primary { background: #2563eb; color: white; }
.btn-outline { border: 1px solid #cbd5e1; color: #1f2937; }
</style>
