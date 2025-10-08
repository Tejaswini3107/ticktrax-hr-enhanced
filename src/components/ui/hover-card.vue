<script setup>
import { HoverCard, HoverCardContent, HoverCardTrigger } from 'radix-vue'
import { cn } from './utils'

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: String, required: false },
  align: { type: String, required: false, default: 'center' },
  sideOffset: { type: Number, required: false, default: 4 },
})
</script>

<template>
  <HoverCard v-bind="props">
    <slot />
  </HoverCard>
</template>

<script>
export const HoverCardTrigger = HoverCardTrigger

export const HoverCardContent = {
  components: { HoverCardContent },
  props: ['asChild', 'as', 'class', 'align', 'sideOffset'],
  template: `
    <HoverCardContent
      :align="align"
      :side-offset="sideOffset"
      :class="cn(
        'z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        class,
      )"
      v-bind="$props"
    >
      <slot />
    </HoverCardContent>
  `,
}
</script>
