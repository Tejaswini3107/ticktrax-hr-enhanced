<template>
  <AspectRatioPrimitive.Root v-bind="$props">
    <slot></slot>
  </AspectRatioPrimitive.Root>
</template>

<script>
import { AspectRatioPrimitive } from 'radix-vue';

export default {
  name: 'AspectRatio',
  components: {
    AspectRatioPrimitive,
  },
  props: {
    ratio: {
      type: Number,
      default: 1,
    },
  },
};
</script>
