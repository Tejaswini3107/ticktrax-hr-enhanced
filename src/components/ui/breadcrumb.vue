<script>
import { h } from 'vue';
import { ChevronRight, MoreHorizontal } from 'lucide-vue-next';
import { cn } from './utils';

export const Breadcrumb = {
  name: 'Breadcrumb',
  setup(props, { slots, attrs }) {
    return () => h('nav', { 'aria-label': 'breadcrumb', ...attrs }, slots.default());
  },
};

export const BreadcrumbList = {
  name: 'BreadcrumbList',
  setup(props, { slots, attrs }) {
    return () => h('ol', {
      class: cn('flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5', attrs.class),
    }, slots.default());
  },
};

export const BreadcrumbItem = {
  name: 'BreadcrumbItem',
  setup(props, { slots, attrs }) {
    return () => h('li', {
      class: cn('inline-flex items-center gap-1.5', attrs.class),
    }, slots.default());
  },
};

export const BreadcrumbLink = {
  name: 'BreadcrumbLink',
  props: {
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const Comp = props.asChild ? 'slot' : 'a';
    return () => h(Comp, {
      class: cn('transition-colors hover:text-foreground', attrs.class),
    }, slots.default());
  },
};

export const BreadcrumbPage = {
  name: 'BreadcrumbPage',
  setup(props, { slots, attrs }) {
    return () => h('span', {
      role: 'link',
      'aria-disabled': 'true',
      'aria-current': 'page',
      class: cn('font-normal text-foreground', attrs.class),
    }, slots.default());
  },
};

export const BreadcrumbSeparator = {
  name: 'BreadcrumbSeparator',
  setup(props, { slots, attrs }) {
    return () => h('li', {
      role: 'presentation',
      'aria-hidden': 'true',
      class: cn('[&>svg]:size-3.5', attrs.class),
    }, slots.default() || h(ChevronRight));
  },
};

export const BreadcrumbEllipsis = {
  name: 'BreadcrumbEllipsis',
  setup(props, { attrs }) {
    return () => h('span', {
      role: 'presentation',
      'aria-hidden': 'true',
      class: cn('flex h-9 w-9 items-center justify-center', attrs.class),
    }, [
      h(MoreHorizontal, { class: 'h-4 w-4' }),
      h('span', { class: 'sr-only' }, 'More'),
    ]);
  },
};
</script>
