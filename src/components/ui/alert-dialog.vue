<script>
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'radix-vue';
import { cn } from './utils';
import { buttonVariants } from './button.vue';

export const AlertDialogVue = AlertDialog;
export const AlertDialogTriggerVue = AlertDialogTrigger;

export const AlertDialogContentVue = {
  name: 'AlertDialogContent',
  components: { AlertDialogContent },
  setup(props, { slots, attrs }) {
    return () => h(AlertDialogContent, {
      class: cn('fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg', attrs.class),
    }, slots.default);
  }
};

export const AlertDialogHeaderVue = {
  name: 'AlertDialogHeader',
  setup(props, { slots, attrs }) {
    return () => h('div', {
      class: cn('flex flex-col space-y-2 text-center sm:text-left', attrs.class)
    }, slots.default);
  }
};

export const AlertDialogFooterVue = {
  name: 'AlertDialogFooter',
  setup(props, { slots, attrs }) {
    return () => h('div', {
      class: cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', attrs.class)
    }, slots.default);
  }
};

export const AlertDialogTitleVue = {
  name: 'AlertDialogTitle',
  components: { AlertDialogTitle },
  setup(props, { slots, attrs }) {
    return () => h(AlertDialogTitle, {
      class: cn('text-lg font-semibold', attrs.class)
    }, slots.default);
  }
};

export const AlertDialogDescriptionVue = {
  name: 'AlertDialogDescription',
  components: { AlertDialogDescription },
  setup(props, { slots, attrs }) {
    return () => h(AlertDialogDescription, {
      class: cn('text-sm text-muted-foreground', attrs.class)
    }, slots.default);
  }
};

export const AlertDialogActionVue = {
  name: 'AlertDialogAction',
  components: { AlertDialogAction },
  setup(props, { slots, attrs }) {
    return () => h(AlertDialogAction, {
      class: cn(buttonVariants(), attrs.class)
    }, slots.default);
  }
};

export const AlertDialogCancelVue = {
  name: 'AlertDialogCancel',
  components: { AlertDialogCancel },
  setup(props, { slots, attrs }) {
    return () => h(AlertDialogCancel, {
      class: cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', attrs.class)
    }, slots.default);
  }
};
</script>
