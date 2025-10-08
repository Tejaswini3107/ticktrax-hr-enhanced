<script setup>
import { Drawer as DrawerPrimitive } from 'vaul-vue'
import { computed } from 'vue'
import { cn } from './utils'

const props = defineProps({
  shouldScaleBackground: { type: Boolean, required: false },
  scrollLockTimeout: { type: Number, required: false },
  dismissible: { type: Boolean, required: false },
  modal: { type: Boolean, required: false },
  open: { type: Boolean, required: false, default: undefined },
  defaultOpen: { type: Boolean, required: false },
  closeThreshold: { type: Number, required: false },
  direction: { type: String, required: false },
  preventScrollRestoration: { type: Boolean, required: false },
  nested: { type: Boolean, required: false },
})

const delegatedProps = computed(() => {
  const { ...delegated } = props
  return delegated
})
</script>

<template>
  <DrawerPrimitive.Root v-bind="delegatedProps">
    <slot />
  </DrawerPrimitive.Root>
</template>

<script>
export const DrawerTrigger = DrawerPrimitive.Trigger
export const DrawerPortal = DrawerPrimitive.Portal
export const DrawerClose = DrawerPrimitive.Close

export const DrawerOverlay = {
  components: { DrawerPrimitiveOverlay: DrawerPrimitive.Overlay },
  props: ['asChild', 'as', 'class'],
  template: `
    <DrawerPrimitiveOverlay
      :class="cn('fixed inset-0 z-50 bg-black/80', props.class)"
      v-bind="$props"
    />
  `,
}

export const DrawerContent = {
  components: { DrawerPrimitiveContent: DrawerPrimitive.Content, DrawerPortal, DrawerOverlay },
  props: ['asChild', 'as', 'class', 'withOverlay'],
  template: `
    <DrawerPortal>
      <DrawerOverlay v-if="withOverlay" />
      <DrawerPrimitiveContent
        :class="cn(
          'fixed z-50 flex h-auto flex-col rounded-t-[10px] border bg-background',
          'inset-x-0 bottom-0 mt-24',
          props.class,
        )"
        v-bind="$props"
      >
        <div class="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        <slot />
      </DrawerPrimitiveContent>
    </DrawerPortal>
  `,
}

export const DrawerHeader = {
  props: ['class'],
  template: `
    <div
      :class="cn('grid gap-1.5 p-4 text-center sm:text-left', props.class)"
      v-bind="$props"
    >
      <slot />
    </div>
  `,
}

export const DrawerFooter = {
  props: ['class'],
  template: `
    <div
      :class="cn('mt-auto flex flex-col gap-2 p-4', props.class)"
      v-bind="$props"
    >
      <slot />
    </div>
  `,
}

export const DrawerTitle = {
  components: { DrawerPrimitiveTitle: DrawerPrimitive.Title },
  props: ['asChild', 'as', 'class'],
  template: `
    <DrawerPrimitiveTitle
      :class="cn(
        'text-lg font-semibold leading-none tracking-tight',
        props.class,
      )"
      v-bind="$props"
    >
      <slot />
    </DrawerPrimitiveTitle>
  `,
}

export const DrawerDescription = {
  components: { DrawerPrimitiveDescription: DrawerPrimitive.Description },
  props: ['asChild', 'as', 'class'],
  template: `
    <DrawerPrimitiveDescription
      :class="cn('text-sm text-muted-foreground', props.class)"
      v-bind="$props"
    >
      <slot />
    </DrawerPrimitiveDescription>
  `,
}
</script>
