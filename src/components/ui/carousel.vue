<script setup>
import { computed, onMounted, onUnmounted, provide, ref, inject } from 'vue'
import useEmblaCarousel from 'embla-carousel-vue'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import { cn } from './utils'
import { Button } from './button.vue'

const props = defineProps({
  opts: { type: Object, required: false },
  plugins: { type: Array, required: false },
  orientation: { type: String, default: 'horizontal' },
})

const emit = defineEmits(['setApi'])

const [carouselRef, api] = useEmblaCarousel(
  computed(() => ({
    ...props.opts,
    axis: props.orientation === 'horizontal' ? 'x' : 'y',
  })),
  props.plugins,
)

const canScrollPrev = ref(false)
const canScrollNext = ref(false)

function onSelect(api) {
  canScrollPrev.value = api.canScrollPrev()
  canScrollNext.value = api.canScrollNext()
}

function scrollPrev() {
  api.value?.scrollPrev()
}

function scrollNext() {
  api.value?.scrollNext()
}

function handleKeyDown(event) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    scrollPrev()
  }
  else if (event.key === 'ArrowRight') {
    event.preventDefault()
    scrollNext()
  }
}

onMounted(() => {
  if (!api.value)
    return

  onSelect(api.value)
  api.value.on('reInit', onSelect)
  api.value.on('select', onSelect)

  emit('setApi', api.value)
})

onUnmounted(() => {
  if (!api.value)
    return
  api.value.off('select', onSelect)
})

provide('carouselContext', {
  carouselRef,
  api,
  opts: props.opts,
  orientation: props.orientation,
  scrollPrev,
  scrollNext,
  canScrollPrev,
  canScrollNext,
})
</script>

<template>
  <div
    data-slot="carousel"
    role="region"
    aria-roledescription="carousel"
    class="relative"
    @keydown="handleKeyDown"
  >
    <slot />
  </div>
</template>

<script>
export const CarouselContent = {
  setup() {
    const { carouselRef, orientation } = inject('carouselContext')
    return { carouselRef, orientation, cn }
  },
  template: `
    <div ref="carouselRef" class="overflow-hidden" data-slot="carousel-content">
      <div
        :class="cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          $attrs.class,
        )"
      >
        <slot />
      </div>
    </div>
  `,
}

export const CarouselItem = {
  setup() {
    const { orientation } = inject('carouselContext')
    return { orientation, cn }
  },
  template: `
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      :class="cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        $attrs.class,
      )"
    >
      <slot />
    </div>
  `,
}

export const CarouselPrevious = {
  components: { Button, ArrowLeft },
  props: {
    variant: { type: String, default: 'outline' },
    size: { type: String, default: 'icon' },
  },
  setup() {
    const { orientation, scrollPrev, canScrollPrev } = inject('carouselContext')
    return { orientation, scrollPrev, canScrollPrev, cn }
  },
  template: `
    <Button
      data-slot="carousel-previous"
      :variant="variant"
      :size="size"
      :class="cn(
        'absolute h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-left-12 top-1/2 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        $attrs.class,
      )"
      :disabled="!canScrollPrev"
      @click="scrollPrev"
    >
      <ArrowLeft class="h-4 w-4" />
      <span class="sr-only">Previous slide</span>
    </Button>
  `,
}

export const CarouselNext = {
  components: { Button, ArrowRight },
  props: {
    variant: { type: String, default: 'outline' },
    size: { type: String, default: 'icon' },
  },
  setup() {
    const { orientation, scrollNext, canScrollNext } = inject('carouselContext')
    return { orientation, scrollNext, canScrollNext, cn }
  },
  template: `
    <Button
      data-slot="carousel-next"
      :variant="variant"
      :size="size"
      :class="cn(
        'absolute h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-right-12 top-1/2 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        $attrs.class,
      )"
      :disabled="!canScrollNext"
      @click="scrollNext"
    >
      <ArrowRight class="h-4 w-4" />
      <span class="sr-only">Next slide</span>
    </Button>
  `,
}
</script>
