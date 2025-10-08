<script setup>
import { computed } from 'vue'
import { Separator as RadixSeparator } from 'radix-vue'
import { cn } from './utils'

const props = defineProps({
  class: { type: String, required: false },
  orientation: { type: String, required: false, default: 'horizontal' },
  decorative: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
})

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <RadixSeparator
    v-bind="delegatedProps"
    :class="cn(
      'shrink-0 bg-border',
      props.orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      props.class,
    )"
  />
</template>

<script>
import { computed, h } from 'vue'
import { Separator as RadixSeparator } from 'radix-vue'
import { cn } from './utils'

// Export Separator as named export
export const Separator = {
  name: 'Separator',
  props: {
    class: { type: String, required: false },
    orientation: { type: String, required: false, default: 'horizontal' },
    decorative: { type: Boolean, required: false },
    asChild: { type: Boolean, required: false },
    as: { type: null, required: false },
  },
  setup(props, { slots }) {
    const delegatedProps = computed(() => {
      const { class: _, ...delegated } = props
      return delegated
    });
    
    return () => h(RadixSeparator, {
      ...delegatedProps.value,
      class: cn(
        'shrink-0 bg-border',
        props.orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        props.class,
      )
    }, slots.default());
  }
};
</script>
