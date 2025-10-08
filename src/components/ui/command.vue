<script setup>
import { computed, h, ref, defineProps, useAttrs } from 'vue'
import { Command as CommandPrimitive, useCommandState } from 'cmdk-vue'
import { Search } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog.vue'
import { cn } from './utils'

const props = defineProps({
  as: { type: [String, Object], default: 'div' },
  asChild: { type: Boolean, default: false },
  class: { type: String, default: '' },
})

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <CommandPrimitive
    :class="cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </CommandPrimitive>
</template>

<script>
export const CommandDialog = {
  components: { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Command },
  props: {
    title: { type: String, default: 'Command Palette' },
    description: { type: String, default: 'Search for a command to run...' },
  },
  template: `
    <Dialog v-bind="$attrs">
      <DialogHeader class="sr-only">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <DialogContent class="overflow-hidden p-0">
        <Command class="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <slot />
        </Command>
      </DialogContent>
    </Dialog>
  `,
}

export const CommandInput = {
  components: { Search, CommandPrimitiveInput: CommandPrimitive.Input },
  setup() {
    const attrs = useAttrs()
    const { class: className, ...delegated } = attrs
    return { className, delegated, cn }
  },
  template: `
    <div class="flex items-center border-b px-3" cmdk-input-wrapper>
      <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <CommandPrimitiveInput
        :class="cn('flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50', className)"
        v-bind="delegated"
      />
    </div>
  `,
}

export const CommandList = {
  components: { CommandPrimitiveList: CommandPrimitive.List },
  setup() {
    const attrs = useAttrs()
    const { class: className, ...delegated } = attrs
    const list = ref(null)
    const filtered = useCommandState(list, () => list.value?.state.filtered)
    return { className, delegated, cn, filtered }
  },
  template: `
    <CommandPrimitiveList
      ref="list"
      :class="cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)"
      v-bind="delegated"
    >
      <div v-if="filtered.count === 0" cmdk-empty role="presentation" class="py-6 text-center text-sm">
        <slot name="empty" />
      </div>
      <slot v-else />
    </CommandPrimitiveList>
  `,
}

export const CommandEmpty = {
  components: { CommandPrimitiveEmpty: CommandPrimitive.Empty },
  setup() {
    const attrs = useAttrs()
    const { class: className, ...delegated } = attrs
    return { className, delegated, cn }
  },
  template: `
    <CommandPrimitiveEmpty
      :class="cn('py-6 text-center text-sm', className)"
      v-bind="delegated"
    />
  `,
}

export const CommandGroup = {
  components: { CommandPrimitiveGroup: CommandPrimitive.Group },
  setup() {
    const attrs = useAttrs()
    const { class: className, ...delegated } = attrs
    return { className, delegated, cn }
  },
  template: `
    <CommandPrimitiveGroup
      :class="cn('overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground', className)"
      v-bind="delegated"
    />
  `,
}

export const CommandSeparator = {
  components: { CommandPrimitiveSeparator: CommandPrimitive.Separator },
  setup() {
    const attrs = useAttrs()
    const { class: className, ...delegated } = attrs
    return { className, delegated, cn }
  },
  template: `
    <CommandPrimitiveSeparator
      :class="cn('-mx-1 h-px bg-border', className)"
      v-bind="delegated"
    />
  `,
}

export const CommandItem = {
  components: { CommandPrimitiveItem: CommandPrimitive.Item },
  setup() {
    const attrs = useAttrs()
    const { class: className, ...delegated } = attrs
    return { className, delegated, cn }
  },
  template: `
    <CommandPrimitiveItem
      :class="cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[disabled]:opacity-50', className)"
      v-bind="delegated"
    />
  `,
}

export const CommandShortcut = {
  setup() {
    const attrs = useAttrs()
    const { class: className, ...delegated } = attrs
    return { className, delegated, cn }
  },
  template: `
    <span
      :class="cn('ml-auto text-xs tracking-widest text-muted-foreground', className)"
      v-bind="delegated"
    >
      <slot />
    </span>
  `,
}
</script>
