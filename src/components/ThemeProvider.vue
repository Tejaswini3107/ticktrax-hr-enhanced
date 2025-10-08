<script setup>
import { ref, onMounted, watch, provide } from 'vue';

const theme = ref('light');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme.value = savedTheme;
  } else {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    theme.value = prefersDark ? 'dark' : 'light';
  }
});

watch(theme, (newTheme) => {
  const root = document.documentElement;
  if (newTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('theme', newTheme);
});

provide('theme', {
  theme,
  toggleTheme,
});
</script>

<template>
  <slot></slot>
</template>

<script>
import { ref, onMounted, watch, provide } from 'vue';

// Export ThemeProvider as named export
export const ThemeProvider = {
  name: 'ThemeProvider',
  setup(props, { slots }) {
    const theme = ref('light');

    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light';
    };

    onMounted(() => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        theme.value = savedTheme;
      } else {
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        theme.value = prefersDark ? 'dark' : 'light';
      }
    });

    watch(theme, (newTheme) => {
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('theme', newTheme);
    });

    provide('theme', {
      theme,
      toggleTheme,
    });

    return () => slots.default();
  }
};
</script>