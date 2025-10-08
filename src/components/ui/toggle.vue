<script setup>
import { computed } from 'vue'
import { Toggle, useForwardPropsEmits } from 'radix-vue'
import { cva } from 'class-variance-authority'
import { cn } from './utils'

const props = defineProps({
  class: { type: String, required: false },
  defaultValue: { type: Boolean, required: false },
  pressed: { type: Boolean, required: false },
  disabled: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  variant: { type: String, required: false, default: 'default' },
  size: { type: String, required: false, default: 'default' },
})
const emits = defineEmits(['update:pressed'])

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 rounded-md px-2.5',
        lg: 'h-11 rounded-md px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const delegatedProps = computed(() => {
  const { class: _, variant: __, size: ___, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <Toggle
    v-bind="forwarded"
    :class="cn(toggleVariants({ variant, size }), props.class)"
  >
    <slot />
  </Toggle>
</template>
