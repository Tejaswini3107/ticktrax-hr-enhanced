<script>
import {
  DialogRoot as RadixDialogRoot,
  DialogContent as RadixDialogContent,
  DialogDescription as RadixDialogDescription,
  DialogTitle as RadixDialogTitle,
  DialogTrigger as RadixDialogTrigger,
  DialogClose as RadixDialogClose,
  DialogPortal,
  DialogOverlay,
} from 'radix-vue';
import { cn } from './utils';
import { XIcon } from 'lucide-vue-next';
import { h } from 'vue';

// Export standard dialog components
export const Dialog = RadixDialogRoot;
export const DialogTrigger = RadixDialogTrigger;
export const DialogClose = RadixDialogClose;

export const DialogContentVue = {
  name: 'DialogContent',
  components: { RadixDialogContent, RadixDialogClose, XIcon },
  setup(props, { slots, attrs }) {
    return () => h(RadixDialogContent, {
      class: cn('fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg', attrs.class),
    }, [
      slots.default?.(),
      h(RadixDialogClose, { class: 'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground' }, [
        h(XIcon, { class: 'h-4 w-4' }),
        h('span', { class: 'sr-only' }, 'Close'),
      ]),
    ]);
  }
};

export const DialogHeaderVue = {
  name: 'DialogHeader',
  setup(props, { slots, attrs }) {
    return () => h('div', {
      class: cn('flex flex-col space-y-1.5 text-center sm:text-left', attrs.class)
    }, slots.default?.());
  }
};

export const DialogFooterVue = {
  name: 'DialogFooter',
  setup(props, { slots, attrs }) {
    return () => h('div', {
      class: cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', attrs.class)
    }, slots.default?.());
  }
};

export const DialogTitleVue = {
  name: 'DialogTitle',
  components: { RadixDialogTitle },
  setup(props, { slots, attrs }) {
    return () => h(RadixDialogTitle, {
      class: cn('text-lg font-semibold leading-none tracking-tight', attrs.class)
    }, slots.default?.());
  }
};

export const DialogDescriptionVue = {
  name: 'DialogDescription',
  components: { RadixDialogDescription },
  setup(props, { slots, attrs }) {
    return () => h(RadixDialogDescription, {
      class: cn('text-sm text-muted-foreground', attrs.class)
    }, slots.default?.());
  }
};

// Export the standard dialog components
export const DialogContent = DialogContentVue;
export const DialogHeader = DialogHeaderVue;
export const DialogFooter = DialogFooterVue;
export const DialogTitle = DialogTitleVue;
export const DialogDescription = DialogDescriptionVue;
</script>
