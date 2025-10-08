<template>
  <div :class="cn('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border', $attrs.class)">
    <slot></slot>
  </div>
</template>

<script>
import { cn } from './utils';

const CardComponent = {
  name: 'Card',
  inheritAttrs: false,
  setup() {
    return { cn };
  },
};

// Export Card as named export
export const Card = CardComponent;

export default CardComponent;
</script>
