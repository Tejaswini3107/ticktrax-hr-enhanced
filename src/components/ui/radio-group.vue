<script setup>
import { computed } from 'vue'
import {
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupRoot,
  useForwardPropsEmits,
} from 'radix-vue'
import { Circle } from 'lucide-vue-next'
import { cn } from './utils'

const props = defineProps({
  class: { type: String, required: false },
  modelValue: { type: String, required: false },
  defaultValue: { type: String, required: false },
  disabled: { type: Boolean, required: false },
  name: { type: String, required: false },
  required: { type: Boolean, required: false },
  orientation: { type: String, required: false },
  dir: { type: String, required: false },
  loop: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
})
const emits = defineEmits(['update:modelValue'])

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <RadioGroupRoot
    :class="cn('grid gap-2', props.class)"
    v-bind="forwarded"
  >
    <slot />
  </RadioGroupRoot>
</template>

<script>
export const RadioGroupItem = {
  components: { RadioGroupItem, RadioGroupIndicator, Circle },
  props: ['class', 'value', 'disabled', 'required', 'name', 'id'],
  template: `
    <RadioGroupItem
      v-bind="$props"
      :class="cn('aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', props.class)"
    >
      <RadioGroupIndicator class="flex items-center justify-center">
        <Circle class="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupIndicator>
    </RadioGroupItem>
  `,
}
</script>
