<script setup>
import { computed } from 'vue'
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from 'radix-vue'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-vue-next'
import { Button, buttonVariants } from './button.vue'
import { cn } from './utils'

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: String, required: false },
  page: { type: Number, required: false },
  defaultPage: { type: Number, required: false },
  itemsPerPage: { type: Number, required: false },
  total: { type: Number, required: true },
  siblingCount: { type: Number, required: false },
  showEdges: { type: Boolean, required: false },
  disabled: { type: Boolean, required: false },
  isActive: { type: Boolean, required: false },
  size: { type: String, required: false, default: 'icon' },
})

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <Pagination
    v-slot="{ page }"
    v-bind="delegatedProps"
  >
    <PaginationList
      v-slot="{ items }"
      :class="cn('flex items-center gap-1', props.class)"
    >
      <PaginationFirst>
        <slot name="first" />
      </PaginationFirst>
      <PaginationPrev>
        <slot name="prev" />
      </PaginationPrev>

      <template v-for="(item, index) in items">
        <PaginationListItem
          v-if="item.type === 'page'"
          :key="index"
          :value="item.value"
          as-child
        >
          <Button
            class="w-10 h-10 p-0"
            :variant="item.value === page ? 'outline' : 'ghost'"
          >
            {{ item.value }}
          </Button>
        </PaginationListItem>
        <PaginationEllipsis
          v-else
          :key="item.type"
          :index="index"
        >
          <slot name="ellipsis" />
        </PaginationEllipsis>
      </template>

      <PaginationNext>
        <slot name="next" />
      </PaginationNext>
      <PaginationLast>
        <slot name="last" />
      </PaginationLast>
    </PaginationList>
  </Pagination>
</template>

<script>
export const PaginationLink = {
  props: ['asChild', 'as', 'class', 'isActive', 'size'],
  template: `
    <a
      :aria-current="isActive ? 'page' : undefined"
      :class="cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        class,
      )"
    >
      <slot />
    </a>
  `,
}

export const PaginationPrevious = {
  components: { PaginationLink, ChevronLeft },
  props: ['asChild', 'as', 'class'],
  template: `
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      :class="cn('gap-1 pl-2.5', class)"
    >
      <ChevronLeft class="h-4 w-4" />
      <span>Previous</span>
    </PaginationLink>
  `,
}

export const PaginationNext = {
  components: { PaginationLink, ChevronRight },
  props: ['asChild', 'as', 'class'],
  template: `
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      :class="cn('gap-1 pr-2.5', class)"
    >
      <span>Next</span>
      <ChevronRight class="h-4 w-4" />
    </PaginationLink>
  `,
}

export const PaginationEllipsis = {
  components: { MoreHorizontal },
  props: ['class'],
  template: `
    <span
      aria-hidden
      :class="cn('flex h-9 w-9 items-center justify-center', class)"
    >
      <MoreHorizontal class="h-4 w-4" />
      <span class="sr-only">More pages</span>
    </span>
  `,
}
</script>
