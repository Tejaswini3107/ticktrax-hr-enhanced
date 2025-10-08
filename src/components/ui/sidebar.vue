<script setup>
import { computed, defineComponent, h, provide, inject, ref, onMounted, onUnmounted } from 'vue'
import { cva } from 'class-variance-authority'
import { PanelLeft } from 'lucide-vue-next'
import { useMediaQuery } from '@vueuse/core'
import { cn } from './utils'
import { Button } from './button.vue'
import { Input } from './input.vue'
import { Separator } from './separator.vue'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './sheet.vue'
import { Skeleton } from './skeleton.vue'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.vue'

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

const SidebarContext = Symbol('SidebarContext')

export function useSidebar() {
  const context = inject(SidebarContext)
  if (!context)
    throw new Error('useSidebar must be used within a SidebarProvider.')

  return context
}

export const SidebarProvider = defineComponent({
  name: 'SidebarProvider',
  props: {
    defaultOpen: { type: Boolean, default: true },
    open: { type: Boolean, default: undefined },
    onOpenChange: { type: Function, default: undefined },
    class: { type: String, default: '' },
    style: { type: Object, default: () => ({}) },
  },
  setup(props, { slots }) {
    const isMobile = useMediaQuery('(max-width: 768px)')
    const openMobile = ref(false)

    const _open = ref(props.defaultOpen)
    const open = computed(() => props.open ?? _open.value)

    function setOpen(value) {
      const openState = typeof value === 'function' ? value(open.value) : value
      if (props.onOpenChange)
        props.onOpenChange(openState)
      else
        _open.value = openState

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    }

    function toggleSidebar() {
      if (isMobile.value)
        openMobile.value = !openMobile.value
      else
        setOpen(open => !open)
    }

    onMounted(() => {
      function handleKeyDown(event) {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
    })

    const state = computed(() => (open.value ? 'expanded' : 'collapsed'))

    provide(SidebarContext, {
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile: (value) => {
        openMobile.value = value
      },
      toggleSidebar,
    })

    return () =>
      h(TooltipProvider, { delayDuration: 0 }, () =>
        h(
          'div',
          {
            'data-slot': 'sidebar-wrapper',
            'style': {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...props.style,
            },
            'class': cn('group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full', props.class),
          },
          slots.default(),
        ),
      )
  },
})

export const Sidebar = defineComponent({
  name: 'Sidebar',
  props: {
    side: { type: String, default: 'left' },
    variant: { type: String, default: 'sidebar' },
    collapsible: { type: String, default: 'offcanvas' },
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (props.collapsible === 'none') {
      return () =>
        h(
          'div',
          {
            'data-slot': 'sidebar',
            'class': cn('bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col', props.class),
          },
          slots.default(),
        )
    }

    if (isMobile.value) {
      return () =>
        h(Sheet, { open: openMobile.value, onOpenChange: setOpenMobile }, () =>
          h(
            SheetContent,
            {
              'data-sidebar': 'sidebar',
              'data-slot': 'sidebar',
              'data-mobile': 'true',
              'class': 'bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden',
              'style': { '--sidebar-width': SIDEBAR_WIDTH_MOBILE },
              'side': props.side,
            },
            () => [
              h(SheetHeader, { class: 'sr-only' }, () => [
                h(SheetTitle, {}, () => 'Sidebar'),
                h(SheetDescription, {}, () => 'Displays the mobile sidebar.'),
              ]),
              h('div', { class: 'flex h-full w-full flex-col' }, slots.default()),
            ],
          ),
        )
    }

    return () =>
      h(
        'div',
        {
          'class': 'group peer text-sidebar-foreground hidden md:block',
          'data-state': state.value,
          'data-collapsible': state.value === 'collapsed' ? props.collapsible : '',
          'data-variant': props.variant,
          'data-side': props.side,
          'data-slot': 'sidebar',
        },
        [
          h('div', {
            'data-slot': 'sidebar-gap',
            'class': cn(
              'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
              'group-data-[collapsible=offcanvas]:w-0',
              'group-data-[side=right]:rotate-180',
              props.variant === 'floating' || props.variant === 'inset'
                ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
                : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
            ),
          }),
          h(
            'div',
            {
              'data-slot': 'sidebar-container',
              'class': cn(
                'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
                props.side === 'left'
                  ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
                  : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
                props.variant === 'floating' || props.variant === 'inset'
                  ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
                  : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
                props.class,
              ),
            },
            h(
              'div',
              {
                'data-sidebar': 'sidebar',
                'data-slot': 'sidebar-inner',
                'class':
                  'bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm',
              },
              slots.default(),
            ),
          ),
        ],
      )
  },
})

export const SidebarTrigger = defineComponent({
  name: 'SidebarTrigger',
  props: {
    class: { type: String, default: '' },
    onClick: { type: Function, default: undefined },
  },
  setup(props, { slots }) {
    const { toggleSidebar } = useSidebar()
    return () =>
      h(
        Button,
        {
          'data-sidebar': 'trigger',
          'data-slot': 'sidebar-trigger',
          'variant': 'ghost',
          'size': 'icon',
          'class': cn('size-7', props.class),
          'onClick': (event) => {
            props.onClick?.(event)
            toggleSidebar()
          },
        },
        () => [h(PanelLeft), h('span', { class: 'sr-only' }, 'Toggle Sidebar'), slots.default()],
      )
  },
})

export const SidebarRail = defineComponent({
  name: 'SidebarRail',
  props: {
    class: { type: String, default: '' },
  },
  setup(props) {
    const { toggleSidebar } = useSidebar()
    return () =>
      h('button', {
        'data-sidebar': 'rail',
        'data-slot': 'sidebar-rail',
        'aria-label': 'Toggle Sidebar',
        'tabIndex': -1,
        'onClick': toggleSidebar,
        'title': 'Toggle Sidebar',
        'class': cn(
          'hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex',
          'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
          '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
          'hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
          '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
          '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
          props.class,
        ),
      })
  },
})

export const SidebarInset = defineComponent({
  name: 'SidebarInset',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'main',
        {
          'data-slot': 'sidebar-inset',
          'class': cn(
            'bg-background relative flex w-full flex-1 flex-col',
            'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
            props.class,
          ),
        },
        slots.default(),
      )
  },
})

export const SidebarInput = defineComponent({
  name: 'SidebarInput',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(Input, {
        'data-slot': 'sidebar-input',
        'data-sidebar': 'input',
        'class': cn('bg-background h-8 w-full shadow-none', props.class),
      }, slots)
  },
})

export const SidebarHeader = defineComponent({
  name: 'SidebarHeader',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          'data-slot': 'sidebar-header',
          'data-sidebar': 'header',
          'class': cn('flex flex-col gap-2 p-2', props.class),
        },
        slots.default(),
      )
  },
})

export const SidebarFooter = defineComponent({
  name: 'SidebarFooter',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          'data-slot': 'sidebar-footer',
          'data-sidebar': 'footer',
          'class': cn('flex flex-col gap-2 p-2', props.class),
        },
        slots.default(),
      )
  },
})

export const SidebarSeparator = defineComponent({
  name: 'SidebarSeparator',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        Separator,
        {
          'data-slot': 'sidebar-separator',
          'data-sidebar': 'separator',
          'class': cn('bg-sidebar-border mx-2 w-auto', props.class),
        },
        slots,
      )
  },
})

export const SidebarContent = defineComponent({
  name: 'SidebarContent',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          'data-slot': 'sidebar-content',
          'data-sidebar': 'content',
          'class': cn(
            'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
            props.class,
          ),
        },
        slots.default(),
      )
  },
})

export const SidebarGroup = defineComponent({
  name: 'SidebarGroup',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          'data-slot': 'sidebar-group',
          'data-sidebar': 'group',
          'class': cn('relative flex w-full min-w-0 flex-col p-2', props.class),
        },
        slots.default(),
      )
  },
})

export const SidebarGroupLabel = defineComponent({
  name: 'SidebarGroupLabel',
  props: {
    class: { type: String, default: '' },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const Comp = props.asChild ? 'slot' : 'div'
    return () =>
      h(
        Comp,
        {
          'data-slot': 'sidebar-group-label',
          'data-sidebar': 'group-label',
          'class': cn(
            'text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
            'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
            props.class,
          ),
        },
        slots.default(),
      )
  },
})

export const SidebarGroupAction = defineComponent({
  name: 'SidebarGroupAction',
  props: {
    class: { type: String, default: '' },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const Comp = props.asChild ? 'slot' : 'button'
    return () =>
      h(
        Comp,
        {
          'data-slot': 'sidebar-group-action',
          'data-sidebar': 'group-action',
          'class': cn(
            'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
            'after:absolute after:-inset-2 md:after:hidden',
            'group-data-[collapsible=icon]:hidden',
            props.class,
          ),
        },
        slots.default(),
      )
  },
})

export const SidebarGroupContent = defineComponent({
  name: 'SidebarGroupContent',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          'data-slot': 'sidebar-group-content',
          'data-sidebar': 'group-content',
          'class': cn('w-full text-sm', props.class),
        },
        slots.default(),
      )
  },
})

export const SidebarMenu = defineComponent({
  name: 'SidebarMenu',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'ul',
        {
          'data-slot': 'sidebar-menu',
          'data-sidebar': 'menu',
          'class': cn('flex w-full min-w-0 flex-col gap-1', props.class),
        },
        slots.default(),
      )
  },
})

export const SidebarMenuItem = defineComponent({
  name: 'SidebarMenuItem',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'li',
        {
          'data-slot': 'sidebar-menu-item',
          'data-sidebar': 'menu-item',
          'class': cn('group/menu-item relative', props.class),
        },
        slots.default(),
      )
  },
})

export const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        outline:
          'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
      },
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export const SidebarMenuButton = defineComponent({
  name: 'SidebarMenuButton',
  props: {
    asChild: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    variant: { type: String, default: 'default' },
    size: { type: String, default: 'default' },
    tooltip: { type: [String, Object], default: undefined },
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    const Comp = props.asChild ? 'slot' : 'button'
    const { isMobile, state } = useSidebar()

    const button = h(
      Comp,
      {
        'data-slot': 'sidebar-menu-button',
        'data-sidebar': 'menu-button',
        'data-size': props.size,
        'data-active': props.isActive,
        'class': cn(sidebarMenuButtonVariants({ variant: props.variant, size: props.size }), props.class),
      },
      slots,
    )

    if (!props.tooltip)
      return button

    const tooltipProps = typeof props.tooltip === 'string' ? { children: props.tooltip } : props.tooltip

    return () =>
      h(Tooltip, {}, () => [
        h(TooltipTrigger, { asChild: true }, () => button),
        h(TooltipContent, {
          side: 'right',
          align: 'center',
          hidden: state.value !== 'collapsed' || isMobile.value,
          ...tooltipProps,
        }),
      ])
  },
})

export const SidebarMenuAction = defineComponent({
  name: 'SidebarMenuAction',
  props: {
    class: { type: String, default: '' },
    asChild: { type: Boolean, default: false },
    showOnHover: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const Comp = props.asChild ? 'slot' : 'button'
    return () =>
      h(
        Comp,
        {
          'data-slot': 'sidebar-menu-action',
          'data-sidebar': 'menu-action',
          'class': cn(
            'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
            'after:absolute after:-inset-2 md:after:hidden',
            'peer-data-[size=sm]/menu-button:top-1',
            'peer-data-[size=default]/menu-button:top-1.5',
            'peer-data-[size=lg]/menu-button:top-2.5',
            'group-data-[collapsible=icon]:hidden',
            props.showOnHover
            && 'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0',
            props.class,
          ),
        },
        slots.default(),
      )
  },
})

export const SidebarMenuBadge = defineComponent({
  name: 'SidebarMenuBadge',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          'data-slot': 'sidebar-menu-badge',
          'data-sidebar': 'menu-badge',
          'class': cn(
            'text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none',
            'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
            'peer-data-[size=sm]/menu-button:top-1',
            'peer-data-[size=default]/menu-button:top-1.5',
            'peer-data-[size=lg]/menu-button:top-2.5',
            'group-data-[collapsible=icon]:hidden',
            props.class,
          ),
        },
        slots.default(),
      )
  },
})

export const SidebarMenuSkeleton = defineComponent({
  name: 'SidebarMenuSkeleton',
  props: {
    class: { type: String, default: '' },
    showIcon: { type: Boolean, default: false },
  },
  setup(props) {
    const width = `${Math.floor(Math.random() * 40) + 50}%`

    return () =>
      h(
        'div',
        {
          'data-slot': 'sidebar-menu-skeleton',
          'data-sidebar': 'menu-skeleton',
          'class': cn('flex h-8 items-center gap-2 rounded-md px-2', props.class),
        },
        [
          props.showIcon && h(Skeleton, { class: 'size-4 rounded-md', 'data-sidebar': 'menu-skeleton-icon' }),
          h(Skeleton, {
            class: 'h-4 max-w-(--skeleton-width) flex-1',
            'data-sidebar': 'menu-skeleton-text',
            'style': { '--skeleton-width': width },
          }),
        ],
      )
  },
})

export const SidebarMenuSub = defineComponent({
  name: 'SidebarMenuSub',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'ul',
        {
          'data-slot': 'sidebar-menu-sub',
          'data-sidebar': 'menu-sub',
          'class': cn(
            'border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
            'group-data-[collapsible=icon]:hidden',
            props.class,
          ),
        },
        slots.default(),
      )
  },
})

export const SidebarMenuSubItem = defineComponent({
  name: 'SidebarMenuSubItem',
  props: {
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'li',
        {
          'data-slot': 'sidebar-menu-sub-item',
          'data-sidebar': 'menu-sub-item',
          'class': cn('group/menu-sub-item relative', props.class),
        },
        slots.default(),
      )
  },
})

export const SidebarMenuSubButton = defineComponent({
  name: 'SidebarMenuSubButton',
  props: {
    asChild: { type: Boolean, default: false },
    size: { type: String, default: 'md' },
    isActive: { type: Boolean, default: false },
    class: { type: String, default: '' },
  },
  setup(props, { slots }) {
    const Comp = props.asChild ? 'slot' : 'a'
    return () =>
      h(
        Comp,
        {
          'data-slot': 'sidebar-menu-sub-button',
          'data-sidebar': 'menu-sub-button',
          'data-size': props.size,
          'data-active': props.isActive,
          'class': cn(
            'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
            'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
            props.size === 'sm' && 'text-xs',
            props.size === 'md' && 'text-sm',
            'group-data-[collapsible=icon]:hidden',
            props.class,
          ),
        },
        slots.default(),
      )
  },
})
</script>
