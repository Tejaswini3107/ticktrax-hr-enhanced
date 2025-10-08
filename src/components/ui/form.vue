<script>
import { provide, inject, defineComponent } from 'vue'
import { useForm, useField } from 'vee-validate'
import { cn } from './utils'
import { Label } from './label.vue'

const FORM_CONTEXT = Symbol('FORM_CONTEXT')

export const Form = defineComponent({
  name: 'Form',
  setup(props, { slots }) {
    const form = useForm()
    provide(FORM_CONTEXT, form)
    return () => slots.default(form)
  },
})

export const FormFieldContext = Symbol('FormFieldContext')

export const FormField = defineComponent({
  name: 'FormField',
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    const { value, errorMessage, handleBlur, handleChange, meta } = useField(props.name)
    provide(FormFieldContext, {
      name: props.name,
      value,
      errorMessage,
      handleBlur,
      handleChange,
      meta,
    })
    return () => slots.default({ value: value.value, errorMessage: errorMessage.value, handleBlur, handleChange, meta })
  },
})

export const FormItemContext = Symbol('FormItemContext')

export const FormItem = defineComponent({
  name: 'FormItem',
  props: {
    class: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    const id = `form-item-${Math.random().toString(36).substring(2, 9)}`
    provide(FormItemContext, { id })
    return () => h('div', { class: cn('space-y-2', props.class) }, slots.default())
  },
})

export function useFormField() {
  const fieldContext = inject(FormFieldContext)
  const itemContext = inject(FormItemContext)

  if (!fieldContext)
    throw new Error('useFormField should be used within <FormField>')

  const { id } = itemContext
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldContext,
  }
}

export const FormLabel = defineComponent({
  name: 'FormLabel',
  props: {
    class: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    const { error, formItemId } = useFormField()
    return () =>
      h(
        Label,
        {
          class: cn(error.value ? 'text-destructive' : '', props.class),
          for: formItemId,
        },
        slots.default,
      )
  },
})

export const FormControl = defineComponent({
  name: 'FormControl',
  setup(_, { slots }) {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
    return () =>
      h(
        'div',
        {
          id: formItemId,
          'aria-describedby': !error.value
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`,
          'aria-invalid': !!error.value,
        },
        slots.default(),
      )
  },
})

export const FormDescription = defineComponent({
  name: 'FormDescription',
  props: {
    class: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    const { formDescriptionId } = useFormField()
    return () =>
      h(
        'p',
        {
          id: formDescriptionId,
          class: cn('text-sm text-muted-foreground', props.class),
        },
        slots.default(),
      )
  },
})

export const FormMessage = defineComponent({
  name: 'FormMessage',
  props: {
    class: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    const { error, formMessageId } = useFormField()
    const body = error.value ? error.value : slots.default?.()

    if (!body)
      return null

    return () =>
      h(
        'p',
        {
          id: formMessageId,
          class: cn('text-sm font-medium text-destructive', props.class),
        },
        body,
      )
  },
})
</script>
