<script setup>
import { inject } from 'vue';
import { Moon, Sun } from 'lucide-vue-next';
import Button from './ui/button.vue';

const { theme, toggleTheme } = inject('theme');
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    @click="toggleTheme"
    class="rounded-full"
    aria-label="Toggle theme"
  >
    <Moon v-if="theme === 'light'" class="h-5 w-5" />
    <Sun v-else class="h-5 w-5" />
  </Button>
</template>
