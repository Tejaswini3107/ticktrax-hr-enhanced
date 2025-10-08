<script setup>
import { ProgressIndicator, ProgressRoot } from 'radix-vue'
import { computed, h } from 'vue'
import { cn } from './utils'

const props = defineProps({
  class: { type: String, required: false },
  modelValue: { type: Number, required: false, default: 0 },
  max: { type: Number, required: false },
  getValueLabel: { type: Function, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
})

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <ProgressRoot
    v-bind="delegatedProps"
    :class="cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', props.class)"
  >
    <ProgressIndicator
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="`transform: translateX(-${100 - (modelValue ?? 0)}%)`"
    />
  </ProgressRoot>
</template>

<script>
import { ProgressIndicator, ProgressRoot } from 'radix-vue'
import { computed, h } from 'vue'
import { cn } from './utils'

// Export Progress as named export
export const Progress = {
  name: 'Progress',
  props: {
    class: { type: String, required: false },
    modelValue: { type: Number, required: false, default: 0 },
    max: { type: Number, required: false },
    getValueLabel: { type: Function, required: false },
    asChild: { type: Boolean, required: false },
    as: { type: null, required: false },
  },
  setup(props, { slots }) {
    const delegatedProps = computed(() => {
      const { class: _, ...delegated } = props
      return delegated
    });
    
    return () => h(ProgressRoot, {
      ...delegatedProps.value,
      class: cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', props.class)
    }, [
      h(ProgressIndicator, {
        class: 'h-full w-full flex-1 bg-primary transition-all',
        style: `transform: translateX(-${100 - (props.modelValue ?? 0)}%)`
      })
    ]);
  }
};
</script>