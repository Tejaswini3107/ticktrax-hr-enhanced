<script setup>
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from 'radix-vue'
import { ChevronDown } from 'lucide-vue-next'
import { cva } from 'class-variance-authority'
import { cn } from './utils'

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: String, required: false },
  orientation: { type: String, required: false },
  delayDuration: { type: Number, required: false },
  skipDelayDuration: { type: Number, required: false },
  active: { type: Boolean, required: false },
  arrowPadding: { type: Number, required: false },
  duration: { type: Number, required: false },
})

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
)
</script>

<template>
  <NavigationMenu v-bind="props">
    <slot />
  </NavigationMenu>
</template>

<script>
export const NavigationMenuList = NavigationMenuList
export const NavigationMenuItem = NavigationMenuItem
export const NavigationMenuViewport = NavigationMenuViewport

export const NavigationMenuContent = {
  components: { NavigationMenuContent },
  props: ['asChild', 'as', 'class', 'duration'],
  template: `
    <NavigationMenuContent
      :class="cn(
        'left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto',
        class,
      )"
      v-bind="$props"
    >
      <slot />
    </NavigationMenuContent>
  `,
}

export const NavigationMenuTrigger = {
  components: { NavigationMenuTrigger, ChevronDown },
  props: ['asChild', 'as', 'class'],
  template: `
    <NavigationMenuTrigger
      :class="cn(navigationMenuTriggerStyle(), 'group', class)"
      v-bind="$props"
    >
      <slot />
      <ChevronDown
        class="relative top-px ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuTrigger>
  `,
}

export const NavigationMenuLink = {
  components: { NavigationMenuLink },
  props: ['asChild', 'as', 'class', 'active'],
  template: `
    <NavigationMenuLink
      :class="cn(
        'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        active && 'bg-accent text-accent-foreground',
        class,
      )"
      v-bind="$props"
    >
      <slot />
    </NavigationMenuLink>
  `,
}

export const NavigationMenuIndicator = {
  components: { NavigationMenuIndicator },
  props: ['asChild', 'as', 'class'],
  template: `
    <NavigationMenuIndicator
      :class="cn(
        'top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in',
        class,
      )"
      v-bind="$props"
    >
      <div class="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuIndicator>
  `,
}
</script>
