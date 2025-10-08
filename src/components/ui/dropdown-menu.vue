<script setup>
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from 'radix-vue'
import { Check, ChevronRight, Circle } from 'lucide-vue-next'
import { cn } from './utils'

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: String, required: false },
  inset: { type: Boolean, required: false },
  checked: { type: [Boolean, String], required: false, default: false },
  sideOffset: { type: Number, required: false, default: 4 },
})
</script>

<template>
  <DropdownMenu v-bind="props">
    <slot />
  </DropdownMenu>
</template>

<script>
export const DropdownMenuTrigger = DropdownMenuTrigger
export const DropdownMenuGroup = DropdownMenuGroup
export const DropdownMenuPortal = DropdownMenuPortal
export const DropdownMenuSub = DropdownMenuSub
export const DropdownMenuRadioGroup = DropdownMenuRadioGroup

export const DropdownMenuSubTrigger = {
  components: { DropdownMenuSubTrigger, ChevronRight },
  props: ['asChild', 'as', 'class', 'inset'],
  template: `
    <DropdownMenuSubTrigger
      :class="cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
        inset && 'pl-8',
        class,
      )"
      v-bind="$props"
    >
      <slot />
      <ChevronRight class="ml-auto h-4 w-4" />
    </DropdownMenuSubTrigger>
  `,
}

export const DropdownMenuSubContent = {
  components: { DropdownMenuSubContent, DropdownMenuPortal },
  props: ['asChild', 'as', 'class'],
  template: `
    <DropdownMenuPortal>
      <DropdownMenuSubContent
        :class="cn(
          'z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          class,
        )"
        v-bind="$props"
      >
        <slot />
      </DropdownMenuSubContent>
    </DropdownMenuPortal>
  `,
}

export const DropdownMenuContent = {
  components: { DropdownMenuContent, DropdownMenuPortal },
  props: ['asChild', 'as', 'class', 'sideOffset'],
  template: `
    <DropdownMenuPortal>
      <DropdownMenuContent
        :side-offset="sideOffset"
        :class="cn(
          'z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          class,
        )"
        v-bind="$props"
      >
        <slot />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  `,
}

export const DropdownMenuItem = {
  components: { DropdownMenuItem },
  props: ['asChild', 'as', 'class', 'inset'],
  template: `
    <DropdownMenuItem
      :class="cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        class,
      )"
      v-bind="$props"
    >
      <slot />
    </DropdownMenuItem>
  `,
}

export const DropdownMenuCheckboxItem = {
  components: { DropdownMenuCheckboxItem, DropdownMenuItemIndicator, Check },
  props: ['asChild', 'as', 'class', 'checked'],
  template: `
    <DropdownMenuCheckboxItem
      :class="cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        class,
      )"
      :checked="checked"
      v-bind="$props"
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuItemIndicator>
          <Check class="h-4 w-4" />
        </DropdownMenuItemIndicator>
      </span>
      <slot />
    </DropdownMenuCheckboxItem>
  `,
}

export const DropdownMenuRadioItem = {
  components: { DropdownMenuRadioItem, DropdownMenuItemIndicator, Circle },
  props: ['asChild', 'as', 'class'],
  template: `
    <DropdownMenuRadioItem
      :class="cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        class,
      )"
      v-bind="$props"
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuItemIndicator>
          <Circle class="h-2 w-2 fill-current" />
        </DropdownMenuItemIndicator>
      </span>
      <slot />
    </DropdownMenuRadioItem>
  `,
}

export const DropdownMenuLabel = {
  components: { DropdownMenuLabel },
  props: ['asChild', 'as', 'class', 'inset'],
  template: `
    <DropdownMenuLabel
      :class="cn(
        'px-2 py-1.5 text-sm font-semibold',
        inset && 'pl-8',
        class,
      )"
      v-bind="$props"
    >
      <slot />
    </DropdownMenuLabel>
  `,
}

export const DropdownMenuSeparator = {
  components: { DropdownMenuSeparator },
  props: ['asChild', 'as', 'class'],
  template: `
    <DropdownMenuSeparator
      :class="cn('-mx-1 my-1 h-px bg-muted', class)"
      v-bind="$props"
    />
  `,
}

export const DropdownMenuShortcut = {
  props: ['class'],
  template: `
    <span
      :class="cn('ml-auto text-xs tracking-widest opacity-60', class)"
    >
      <slot />
    </span>
  `,
}
</script>
