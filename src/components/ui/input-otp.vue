<script setup>
import { ref, computed } from 'vue'
import { OTPInput, REGEXP_ONLY_DIGITS } from 'vue-input-otp'
import { Minus } from 'lucide-vue-next'
import { cn } from './utils'

const props = defineProps({
  class: { type: String, required: false },
  containerClass: { type: String, required: false },
  separator: { type: Boolean, required: false },
})

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <OTPInput
    v-bind="delegatedProps"
    :class="cn('disabled:cursor-not-allowed', props.class)"
    :container-class="cn('flex items-center gap-2 has-[:disabled]:opacity-50', props.containerClass)"
  >
    <template #group="{ slots, isGrouped }">
      <div
        v-if="isGrouped"
        class="flex items-center"
      >
        <slot />
      </div>
    </template>
    <template #slot="{ slotProps, inputProps, isFocused, isActive, hasFakeCaret }">
      <div
        :class="[
          'relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
          isActive && 'z-10 ring-2 ring-ring ring-offset-background',
        ]"
      >
        <input
          v-bind="inputProps"
          :class="['absolute inset-0 h-full w-full bg-transparent text-center']"
        >
        <div
          v-if="slotProps.char !== null"
          class="text-lg"
        >
          {{ slotProps.char }}
        </div>
        <div
          v-if="hasFakeCaret"
          class="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div class="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      </div>
    </template>

    <template
      v-if="separator"
      #separator
    >
      <div class="flex items-center justify-center">
        <Minus />
      </div>
    </template>
  </OTPInput>
</template>
