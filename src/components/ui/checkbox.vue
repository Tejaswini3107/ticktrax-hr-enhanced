<template>
  <CheckboxRoot
    :class="cn('peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground', $attrs.class)"
    v-bind="$props"
  >
    <CheckboxIndicator class="flex h-full w-full items-center justify-center text-center">
      <Check class="h-4 w-4" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>

<script>
import { CheckboxRoot, CheckboxIndicator } from 'radix-vue';
import { Check } from 'lucide-vue-next';
import { cn } from './utils';

const CheckboxComponent = {
  name: 'Checkbox',
  components: {
    CheckboxRoot,
    CheckboxIndicator,
    Check,
  },
  setup() {
    return { cn };
  },
};

// Export Checkbox as named export
export const Checkbox = CheckboxComponent;

export default CheckboxComponent;
</script>
