
<script>
import { cn } from './utils'
import { h } from 'vue'

// Export the main Table component
export const Table = {
  name: 'Table',
  props: {
    class: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    return () => h('div', { class: 'w-full overflow-auto' }, [
      h('table', { class: cn('w-full caption-bottom text-sm', props.class) }, slots.default?.())
    ]);
  }
};
export const TableHeader = {
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () => h('thead', { class: cn('[&_tr]:border-b', props.class) }, slots.default?.());
  }
}
export const TableBody = {
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () => h('tbody', { class: cn('[&_tr:last-child]:border-0', props.class) }, slots.default?.());
  }
}
export const TableFooter = {
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () => h('tfoot', { class: cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', props.class) }, slots.default?.());
  }
}
export const TableRow = {
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () => h('tr', { class: cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', props.class) }, slots.default?.());
  }
}
export const TableHead = {
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () => h('th', { class: cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', props.class) }, slots.default?.());
  }
}
export const TableCell = {
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () => h('td', { class: cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', props.class) }, slots.default?.());
  }
}
export const TableCaption = {
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () => h('caption', { class: cn('mt-4 text-sm text-muted-foreground', props.class) }, slots.default?.());
  }
}
</script>
