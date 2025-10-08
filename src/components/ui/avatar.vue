<script>
import { h } from 'vue';
import { AvatarRoot, AvatarFallback as RadixAvatarFallback, AvatarImage as RadixAvatarImage } from 'radix-vue';
import { cn } from './utils';

export const Avatar = {
  name: 'Avatar',
  components: { AvatarRoot },
  setup(props, { slots, attrs }) {
    return () => h(AvatarRoot, {
      class: cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', attrs.class),
    }, slots.default);
  }
};

export const AvatarImage = {
  name: 'AvatarImage',
  components: { RadixAvatarImage },
  setup(props, { slots, attrs }) {
    return () => h(RadixAvatarImage, {
      class: cn('aspect-square h-full w-full', attrs.class),
    }, slots.default);
  }
};

export const AvatarFallback = {
  name: 'AvatarFallback',
  components: { RadixAvatarFallback },
  setup(props, { slots, attrs }) {
    return () => h(RadixAvatarFallback, {
      class: cn('flex h-full w-full items-center justify-center rounded-full bg-muted', attrs.class),
    }, slots.default);
  }
};
</script>
