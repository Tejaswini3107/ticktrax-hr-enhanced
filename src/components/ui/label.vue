<template>
  <label :class="cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', $attrs.class)">
    <slot></slot>
  </label>
</template>

<script>
import { cn } from './utils';

const LabelComponent = {
  name: 'Label',
  setup() {
    return { cn };
  },
};

// Export Label as named export
export const Label = LabelComponent;

export default LabelComponent;
</script>
