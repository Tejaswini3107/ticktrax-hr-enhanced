<template>
  <div :class="cn(alertVariants({ variant }), $attrs.class)" role="alert">
    <slot></slot>
  </div>
</template>

<script>
import { cva } from 'class-variance-authority';
import { cn } from './utils';

export const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const AlertComponent = {
  name: 'Alert',
  props: {
    variant: {
      type: String,
      default: 'default',
    },
  },
  setup() {
    return { cn, alertVariants };
  },
};

// Export Alert as named export
export const Alert = AlertComponent;

// AlertDescription component
export const AlertDescription = {
  name: 'AlertDescription',
  template: `
    <div class="text-sm [&_p]:leading-relaxed" data-slot="alert-description">
      <slot />
    </div>
  `,
};

export default AlertComponent;
</script>
