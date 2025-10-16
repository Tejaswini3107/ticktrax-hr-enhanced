<script setup>
import {
  DialogContent as RadixDialogContent,
  DialogClose as RadixDialogClose,
  DialogPortal,
  DialogOverlay,
} from 'radix-vue';
import { cn } from '../../utils/cn.js';
import { XIcon } from 'lucide-vue-next';
</script>

<template>
  <!-- Portal the dialog to the document root so fixed positioning centers correctly -->
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />

    <!-- Use a full-screen flex container so the dialog box is vertically and horizontally centered reliably -->
    <RadixDialogContent
      :class="cn('fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]')"
      v-bind="$attrs"
    >
      <div :class="cn('relative w-full max-w-lg max-h-[90vh] overflow-y-auto grid gap-4 border bg-background p-6 shadow-lg sm:rounded-lg', $attrs.class)">
        <slot />
        <RadixDialogClose class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <XIcon class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </RadixDialogClose>
      </div>
    </RadixDialogContent>
  </DialogPortal>
</template>
