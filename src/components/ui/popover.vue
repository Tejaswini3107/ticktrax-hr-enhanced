<script setup>
import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from 'radix-vue'
import { cn } from './utils'

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: String, required: false },
  defaultOpen: { type: Boolean, required: false },
  open: { type: Boolean, required: false, default: undefined },
  modal: { type: Boolean, required: false },
  align: { type: String, required: false, default: 'center' },
  sideOffset: { type: Number, required: false, default: 4 },
})
</script>

<template>
  <Popover v-bind="props">
    <slot />
  </Popover>
</template>

<script>
export const PopoverTrigger = PopoverTrigger
export const PopoverAnchor = PopoverAnchor
export const PopoverClose = PopoverClose
export const PopoverPortal = PopoverPortal

export const PopoverContent = {
  components: { PopoverContent, PopoverPortal },
  props: ['asChild', 'as', 'class', 'align', 'sideOffset'],
  template: `
    <PopoverPortal>
      <PopoverContent
        :align="align"
        :side-offset="sideOffset"
        :class="cn(
          'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          class,
        )"
        v-bind="$props"
      >
        <slot />
      </PopoverContent>
    </PopoverPortal>
  `,
}
</script>
