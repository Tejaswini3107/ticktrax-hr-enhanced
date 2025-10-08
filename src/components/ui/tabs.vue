
<script>
import { computed, h } from 'vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'radix-vue'
import { cn } from './utils'

// Export Tabs as named export
export const Tabs = {
  name: 'Tabs',
  props: {
    class: { type: String, required: false },
    defaultValue: { type: String, required: false },
    orientation: { type: String, required: false },
    activationMode: { type: String, required: false },
    asChild: { type: Boolean, required: false },
    as: { type: null, required: false },
  },
  setup(props, { slots }) {
    const delegatedProps = computed(() => {
      const { class: _, ...delegated } = props
      return delegated
    });
    
    return () => h(TabsRoot, {
      ...delegatedProps.value,
      class: cn('w-full', props.class)
    }, slots.default?.());
  }
};

// Export other tab components as named exports
export { TabsList, TabsTrigger, TabsContent };
</script>
