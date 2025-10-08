<script setup>
import { computed, provide } from 'vue'
import {
  ToggleGroupRoot,
  ToggleGroupItem,
  useForwardPropsEmits,
} from 'radix-vue'
import { toggleVariants } from './toggle.vue'
import { cn } from './utils'

const props = defineProps({
  class: { type: String, required: false },
  modelValue: { type: [String, Array], required: false },
  defaultValue: { type: [String, Array], required: false },
  type: { type: String, required: false },
  disabled: { type: Boolean, required: false },
  rovingFocus: { type: Boolean, required: false },
  orientation: { type: String, required: false },
  dir: { type: String, required: false },
  loop: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  variant: { type: String, required: false, default: 'default' },
  size: { type: String, required: false, default: 'default' },
})
const emits = defineEmits(['update:modelValue'])

provide('toggleGroup', {
  variant: props.variant,
  size: props.size,
})

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ToggleGroupRoot
    v-bind="forwarded"
    :class="cn('flex items-center justify-center gap-1', props.class)"
  >
    <slot />
  </ToggleGroupRoot>
</template>

<script>
export const ToggleGroupItem = {
  components: { ToggleGroupItem },
  props: ['class', 'value', 'disabled', 'asChild', 'as'],
  setup(props) {
    const context = inject('toggleGroup')
    return { context, toggleVariants, cn }
  },
  template: `
    <ToggleGroupItem
      v-bind="$props"
      :class="cn(
        toggleVariants({
          variant: context.variant,
          size: context.size,
        }),
        props.class,
      )"
    >
      <slot />
    </ToggleGroupItem>
  `,
}
</script>
