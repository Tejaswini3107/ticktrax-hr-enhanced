<script setup>
import { useVModel } from '@vueuse/core'
import { cn } from './utils'

const props = defineProps({
  class: {
    type: String,
    default: '',
  },
  defaultValue: {
    type: [String, Number],
    default: '',
  },
  modelValue: {
    type: [String, Number],
    default: undefined,
  },
})

const emits = defineEmits(['update:modelValue'])

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <textarea
    v-model="modelValue"
    :class="cn('flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', props.class)"
  />
</template>

<script>
import { useVModel } from '@vueuse/core'
import { cn } from './utils'

// Export Textarea as named export
export const Textarea = {
  name: 'Textarea',
  props: {
    class: {
      type: String,
      default: '',
    },
    defaultValue: {
      type: [String, Number],
      default: '',
    },
    modelValue: {
      type: [String, Number],
      default: undefined,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const modelValue = useVModel(props, 'modelValue', emit, {
      passive: true,
      defaultValue: props.defaultValue,
    });
    
    return { cn, modelValue };
  },
  template: `
    <textarea
      v-model="modelValue"
      :class="cn('flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', props.class)"
    />
  `
};
</script>
