<script setup>
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuItemIndicator,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from 'radix-vue'
import { Check, ChevronRight, Circle } from 'lucide-vue-next'
import { cn } from './utils'

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: String, required: false },
  inset: { type: Boolean, required: false },
  checked: { type: [Boolean, String], required: false, default: false },
})
</script>

<template>
  <ContextMenu v-bind="props">
    <slot />
  </ContextMenu>
</template>

<script>
export const ContextMenuTrigger = ContextMenuTrigger
export const ContextMenuGroup = ContextMenuGroup
export const ContextMenuPortal = ContextMenuPortal
export const ContextMenuSub = ContextMenuSub
export const ContextMenuRadioGroup = ContextMenuRadioGroup

export const ContextMenuSubTrigger = {
  components: { ContextMenuSubTrigger, ChevronRight },
  props: ['asChild', 'as', 'class', 'inset'],
  template: `
    <ContextMenuSubTrigger
      :class="cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
        inset && 'pl-8',
        class,
      )"
      v-bind="$props"
    >
      <slot />
      <ChevronRight class="ml-auto h-4 w-4" />
    </ContextMenuSubTrigger>
  `,
}

export const ContextMenuSubContent = {
  components: { ContextMenuSubContent, ContextMenuPortal },
  props: ['asChild', 'as', 'class'],
  template: `
    <ContextMenuPortal>
      <ContextMenuSubContent
        :class="cn(
          'z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          class,
        )"
        v-bind="$props"
      >
        <slot />
      </ContextMenuSubContent>
    </ContextMenuPortal>
  `,
}

export const ContextMenuContent = {
  components: { ContextMenuContent, ContextMenuPortal },
  props: ['asChild', 'as', 'class'],
  template: `
    <ContextMenuPortal>
      <ContextMenuContent
        :class="cn(
          'z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          class,
        )"
        v-bind="$props"
      >
        <slot />
      </ContextMenuContent>
    </ContextMenuPortal>
  `,
}

export const ContextMenuItem = {
  components: { ContextMenuItem },
  props: ['asChild', 'as', 'class', 'inset'],
  template: `
    <ContextMenuItem
      :class="cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        class,
      )"
      v-bind="$props"
    >
      <slot />
    </ContextMenuItem>
  `,
}

export const ContextMenuCheckboxItem = {
  components: { ContextMenuCheckboxItem, ContextMenuItemIndicator, Check },
  props: ['asChild', 'as', 'class', 'checked'],
  template: `
    <ContextMenuCheckboxItem
      :class="cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        class,
      )"
      :checked="checked"
      v-bind="$props"
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuItemIndicator>
          <Check class="h-4 w-4" />
        </ContextMenuItemIndicator>
      </span>
      <slot />
    </ContextMenuCheckboxItem>
  `,
}

export const ContextMenuRadioItem = {
  components: { ContextMenuRadioItem, ContextMenuItemIndicator, Circle },
  props: ['asChild', 'as', 'class'],
  template: `
    <ContextMenuRadioItem
      :class="cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        class,
      )"
      v-bind="$props"
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuItemIndicator>
          <Circle class="h-2 w-2 fill-current" />
        </ContextMenuItemIndicator>
      </span>
      <slot />
    </ContextMenuRadioItem>
  `,
}

export const ContextMenuLabel = {
  components: { ContextMenuLabel },
  props: ['asChild', 'as', 'class', 'inset'],
  template: `
    <ContextMenuLabel
      :class="cn(
        'px-2 py-1.5 text-sm font-semibold text-foreground',
        inset && 'pl-8',
        class,
      )"
      v-bind="$props"
    >
      <slot />
    </ContextMenuLabel>
  `,
}

export const ContextMenuSeparator = {
  components: { ContextMenuSeparator },
  props: ['asChild', 'as', 'class'],
  template: `
    <ContextMenuSeparator
      :class="cn('-mx-1 my-1 h-px bg-border', class)"
      v-bind="$props"
    />
  `,
}

export const ContextMenuShortcut = {
  props: ['class'],
  template: `
    <span
      :class="cn('ml-auto text-xs tracking-widest text-muted-foreground', class)"
    >
      <slot />
    </span>
  `,
}
</script>
