<script>
import { h } from 'vue';
import { cn } from './utils';

export const CardHeader = {
  name: 'CardHeader',
  setup(props, { slots, attrs }) {
    return () => h('div', {
      'data-slot': 'card-header',
      class: cn('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', attrs.class),
    }, slots.default());
  },
};

export const CardTitle = {
  name: 'CardTitle',
  setup(props, { slots, attrs }) {
    return () => h('h4', {
      'data-slot': 'card-title',
      class: cn('leading-none', attrs.class),
    }, slots.default());
  },
};

export const CardDescription = {
  name: 'CardDescription',
  setup(props, { slots, attrs }) {
    return () => h('p', {
      'data-slot': 'card-description',
      class: cn('text-muted-foreground', attrs.class),
    }, slots.default());
  },
};

export const CardAction = {
  name: 'CardAction',
  setup(props, { slots, attrs }) {
    return () => h('div', {
      'data-slot': 'card-action',
      class: cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', attrs.class),
    }, slots.default());
  },
};

export const CardContent = {
  name: 'CardContent',
  setup(props, { slots, attrs }) {
    return () => h('div', {
      'data-slot': 'card-content',
      class: cn('px-6 [&:last-child]:pb-6', attrs.class),
    }, slots.default());
  },
};

export const CardFooter = {
  name: 'CardFooter',
  setup(props, { slots, attrs }) {
    return () => h('div', {
      'data-slot': 'card-footer',
      class: cn('flex items-center px-6 pb-6 [.border-t]:pt-6', attrs.class),
    }, slots.default());
  },
};
</script>
