<script setup>
import { computed } from 'vue'
import {
  Dialog as Sheet,
  DialogContent as SheetContent,
  DialogDescription as SheetDescription,
  DialogHeader as SheetHeader,
  DialogTitle as SheetTitle,
  DialogTrigger as SheetTrigger,
  DialogClose as SheetClose,
  DialogPortal as SheetPortal,
  DialogOverlay as SheetOverlay,
} from 'radix-vue'
import { cva } from 'class-variance-authority'
import { X } from 'lucide-vue-next'
import { cn } from './utils'

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
)

const props = defineProps({
  side: { type: String, required: false },
  class: { type: String, required: false },
})

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <Sheet v-bind="delegatedProps">
    <slot />
  </Sheet>
</template>

<script>
export const SheetTrigger = SheetTrigger
export const SheetClose = SheetClose
export const SheetPortal = SheetPortal

export const SheetOverlay = {
  components: { SheetOverlay },
  props: ['class', 'asChild', 'as'],
  template: `
    <SheetOverlay
      :class="cn(
        'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        props.class,
      )"
      v-bind="$props"
    />
  `,
}

export const SheetContent = {
  components: { SheetPortal, SheetOverlay, SheetContent, X },
  props: ['side', 'class', 'asChild', 'as'],
  template: `
    <SheetPortal>
      <SheetOverlay />
      <SheetContent
        :class="cn(sheetVariants({ side }), props.class)"
        v-bind="$props"
      >
        <slot />
        <SheetClose
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
        >
          <X class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </SheetClose>
      </SheetContent>
    </SheetPortal>
  `,
}

export const SheetHeader = {
  props: ['class'],
  template: `
    <div
      :class="cn('flex flex-col space-y-2 text-center sm:text-left', props.class)"
    >
      <slot />
    </div>
  `,
}

export const SheetFooter = {
  props: ['class'],
  template: `
    <div
      :class="cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        props.class,
      )"
    >
      <slot />
    </div>
  `,
}

export const SheetTitle = {
  components: { SheetTitle },
  props: ['class', 'asChild', 'as'],
  template: `
    <SheetTitle
      :class="cn('text-lg font-semibold text-foreground', props.class)"
      v-bind="$props"
    >
      <slot />
    </SheetTitle>
  `,
}

export const SheetDescription = {
  components: { SheetDescription },
  props: ['class', 'asChild', 'as'],
  template: `
    <SheetDescription
      :class="cn('text-sm text-muted-foreground', props.class)"
      v-bind="$props"
    >
      <slot />
    </SheetDescription>
  `,
}
</script>
