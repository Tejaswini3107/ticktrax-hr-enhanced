<template>
  <AccordionRoot :class="cn('w-full', $attrs.class)" v-bind="$props">
    <slot></slot>
  </AccordionRoot>
</template>

<script>
import { AccordionRoot, AccordionItem, AccordionHeader, AccordionContent, AccordionTrigger } from 'radix-vue';
import { cn } from './utils';

// Named exports for individual accordion components
export { AccordionContent, AccordionItem, AccordionTrigger };

const AccordionComponent = {
  name: 'Accordion',
  components: {
    AccordionRoot,
    AccordionItem,
    AccordionHeader,
    AccordionContent,
    AccordionTrigger,
  },
  setup() {
    return { cn };
  },
};

// Export Accordion as named export
export const Accordion = AccordionComponent;

export default AccordionComponent;
</script>
