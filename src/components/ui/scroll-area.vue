
<script>
import { computed, h } from 'vue'
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from 'radix-vue'
import { cn } from './utils'

// Export ScrollArea as named export
export const ScrollArea = {
  name: 'ScrollArea',
  props: {
    class: { type: String, required: false },
    orientation: { type: String, required: false, default: 'vertical' },
    type: { type: String, required: false },
    dir: { type: String, required: false },
    scrollHideDelay: { type: Number, required: false },
    asChild: { type: Boolean, required: false },
    as: { type: null, required: false },
  },
  setup(props, { slots }) {
    const delegatedProps = computed(() => {
      const { class: _, ...delegated } = props
      return delegated
    });
    
    return () => h(ScrollAreaRoot, {
      class: cn('relative overflow-hidden', props.class),
      ...delegatedProps.value
    }, {
      default: () => [
        h(ScrollAreaViewport, { class: 'h-full w-full rounded-[inherit]' }, {
          default: () => (slots.default ? slots.default() : [])
        }),
        h(ScrollBar, null, {
          default: () => [
            h(ScrollAreaThumb, { class: 'relative flex-1 rounded-full bg-border' })
          ]
        }),
        h(ScrollAreaCorner)
      ]
    });
  }
};

export const ScrollBar = {
  components: { ScrollAreaScrollbar, ScrollAreaThumb },
  props: ['class', 'orientation'],
  setup(props) {
    return () => h(ScrollAreaScrollbar, {
      class: cn(
        'flex touch-none select-none transition-colors',
        props.orientation === 'vertical'
          && 'h-full w-2.5 border-l border-l-transparent p-px',
        props.orientation === 'horizontal'
          && 'h-2.5 flex-col border-t border-t-transparent p-px',
        props.class,
      )
    }, [
      h(ScrollAreaThumb, { class: 'relative flex-1 rounded-full bg-border' })
    ]);
  }
}

// Default export for template usage
export default ScrollArea;
</script>
