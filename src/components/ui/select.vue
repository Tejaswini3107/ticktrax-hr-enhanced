<script>
import {
  SelectRoot as RadixSelectRoot,
  SelectContent as RadixSelectContent,
  SelectGroup as RadixSelectGroup,
  SelectItem as RadixSelectItem,
  SelectItemText as RadixSelectItemText,
  SelectLabel as RadixSelectLabel,
  SelectSeparator as RadixSelectSeparator,
  SelectTrigger as RadixSelectTrigger,
  SelectValue as RadixSelectValue,
  SelectPortal,
  SelectViewport,
} from 'radix-vue';
import { cn } from './utils';
import { ChevronDownIcon, CheckIcon } from 'lucide-vue-next';
import { h } from 'vue';

// Export standard select components
export const Select = RadixSelectRoot;
export const SelectGroup = RadixSelectGroup;
export const SelectValue = RadixSelectValue;
export const SelectLabel = RadixSelectLabel;
export const SelectSeparator = RadixSelectSeparator;

export const SelectTriggerVue = {
  name: 'SelectTrigger',
  components: { RadixSelectTrigger, ChevronDownIcon },
  setup(props, { slots, attrs }) {
    return () => h(RadixSelectTrigger, {
      class: cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', attrs.class),
    }, [slots.default?.(), h(ChevronDownIcon, { class: 'h-4 w-4 opacity-50' })]);
  }
};

export const SelectContentVue = {
  name: 'SelectContent',
  components: { RadixSelectContent },
  setup(props, { slots, attrs }) {
    return () => h(RadixSelectContent, {
      class: cn('relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2', attrs.class),
    }, slots.default?.());
  }
};

export const SelectItemVue = {
  name: 'SelectItem',
  components: { RadixSelectItem, RadixSelectItemText, CheckIcon },
  setup(props, { slots, attrs }) {
    return () => h(RadixSelectItem, {
      class: cn('relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', attrs.class),
    }, [
      h('span', { class: 'absolute left-2 flex h-3.5 w-3.5 items-center justify-center' }, h(CheckIcon, { class: 'h-4 w-4' })),
      h(RadixSelectItemText, {}, slots.default?.()),
    ]);
  }
};

// Export the standard select components
export const SelectTrigger = SelectTriggerVue;
export const SelectContent = SelectContentVue;
export const SelectItem = SelectItemVue;
</script>
