<script setup>
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarItemIndicator,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from 'radix-vue'
import { Check, ChevronRight, Circle } from 'lucide-vue-next'
import { cn } from './utils'

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: String, required: false },
  inset: { type: Boolean, required: false },
  checked: { type: [Boolean, String], required: false, default: false },
  align: { type: String, required: false, default: 'start' },
  alignOffset: { type: Number, required: false, default: -4 },
  sideOffset: { type: Number, required: false, default: 8 },
})
</script>

<template>
  <Menubar
    :class="cn(
      'flex h-10 items-center space-x-1 rounded-md border bg-background p-1',
      props.class,
    )"
    v-bind="props"
  >
    <slot />
  </Menubar>
</template>

<script>
export const MenubarMenu = MenubarMenu
export const MenubarGroup = MenubarGroup
export const MenubarPortal = MenubarPortal
export const MenubarSub = MenubarSub
export const MenubarRadioGroup = MenubarRadioGroup
export const MenubarTrigger = MenubarTrigger

export const MenubarSubTrigger = {
  components: { MenubarSubTrigger, ChevronRight },
  props: ['asChild', 'as', 'class', 'inset'],
  template: `
    <MenubarSubTrigger
      :class="cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
        inset && 'pl-8',
        class,
      )"
      v-bind="$props"
    >
      <slot />
      <ChevronRight class="ml-auto h-4 w-4" />
    </MenubarSubTrigger>
  `,
}

export const MenubarSubContent = {
  components: { MenubarSubContent, MenubarPortal },
  props: ['asChild', 'as', 'class'],
  template: `
    <MenubarPortal>
      <MenubarSubContent
        :class="cn(
          'z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          class,
        )"
        v-bind="$props"
      >
        <slot />
      </MenubarSubContent>
    </MenubarPortal>
  `,
}

export const MenubarContent = {
  components: { MenubarContent, MenubarPortal },
  props: ['asChild', 'as', 'class', 'align', 'alignOffset', 'sideOffset'],
  template: `
    <MenubarPortal>
      <MenubarContent
        :align="align"
        :align-offset="alignOffset"
        :side-offset="sideOffset"
        :class="cn(
          'z-50 min-w-48 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          class,
        )"
        v-bind="$props"
      >
        <slot />
      </MenubarContent>
    </MenubarPortal>
  `,
}

export const MenubarItem = {
  components: { MenubarItem },
  props: ['asChild', 'as', 'class', 'inset'],
  template: `
    <MenubarItem
      :class="cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        class,
      )"
      v-bind="$props"
    >
      <slot />
    </MenubarItem>
  `,
}

export const MenubarCheckboxItem = {
  components: { MenubarCheckboxItem, MenubarItemIndicator, Check },
  props: ['asChild', 'as', 'class', 'checked'],
  template: `
    <MenubarCheckboxItem
      :class="cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        class,
      )"
      :checked="checked"
      v-bind="$props"
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarItemIndicator>
          <Check class="h-4 w-4" />
        </MenubarItemIndicator>
      </span>
      <slot />
    </MenubarCheckboxItem>
  `,
}

export const MenubarRadioItem = {
  components: { MenubarRadioItem, MenubarItemIndicator, Circle },
  props: ['asChild', 'as', 'class'],
  template: `
    <MenubarRadioItem
      :class="cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        class,
      )"
      v-bind="$props"
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarItemIndicator>
          <Circle class="h-2 w-2 fill-current" />
        </MenubarItemIndicator>
      </span>
      <slot />
    </MenubarRadioItem>
  `,
}

export const MenubarLabel = {
  components: { MenubarLabel },
  props: ['asChild', 'as', 'class', 'inset'],
  template: `
    <MenubarLabel
      :class="cn(
        'px-2 py-1.5 text-sm font-semibold',
        inset && 'pl-8',
        class,
      )"
      v-bind="$props"
    >
      <slot />
    </MenubarLabel>
  `,
}

export const MenubarSeparator = {
  components: { MenubarSeparator },
  props: ['asChild', 'as', 'class'],
  template: `
    <MenubarSeparator
      :class="cn('-mx-1 my-1 h-px bg-muted', class)"
      v-bind="$props"
    />
  `,
}

export const MenubarShortcut = {
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
