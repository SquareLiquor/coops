import { asyncSuperFormSubmit, debounce } from '$lib/utils'
import type { ActionResult } from '@sveltejs/kit'
import { superForm, type FormOptions, type SuperValidated } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { BaseSchema, InferOutput } from 'valibot'

type BuilderSuperFormParamaters<S extends BaseSchema<any, any, any>> = {
  form: SuperValidated<InferOutput<S>>
  schema: S
  changeHandler?: {
    beforeChange?: () => void
    afterChange?: () => void
  }
  submitHandler?: {
    beforeSubmit?: () => void
  }
  resultHandler?: {
    handleSuccess?: (result: any) => void // TODO: any to ActionResult
    handleFailure?: (result: any) => void
  }
  options?: Record<string, any>
}

export const buildFilterForm = <S extends BaseSchema<any, any, any>>(params: BuilderSuperFormParamaters<S>) => {
  const { form, schema, changeHandler = {}, submitHandler = {}, resultHandler = {}, options = {} } = params
  const { beforeChange, afterChange } = changeHandler
  const { beforeSubmit } = submitHandler
  const { handleSuccess, handleFailure } = resultHandler
  const { dataType = 'json', resetForm = false } = options

  const formOptions: FormOptions<InferOutput<S>, any, InferOutput<S>> = {
    dataType,
    validators: valibot(schema),
    resetForm,
    onChange: async (event: any) => {
      const { target } = event
      try {
        beforeChange && beforeChange()

        if ((target as HTMLInputElement)?.type === 'text') {
          debounce(async () => {
            await asyncSuperFormSubmit(submit, submitting)
          }, 300)
        } else {
          await asyncSuperFormSubmit(submit, submitting)
        }

        afterChange && afterChange()
      } catch (error) {
        console.error('validate form error:', error)
      }
    },
    onSubmit: async () => {
      beforeSubmit && beforeSubmit()
    },
    onResult: async ({ result }: { result: ActionResult }) => {
      if (result?.type === 'success') handleSuccess && handleSuccess(result)
      if (result?.type === 'failure') handleFailure && handleFailure(result)
    },
  }

  const validateAndSubmit = async () => {
    const result = await validateForm({ update: true })
    if (result.valid) await asyncSuperFormSubmit(submit, submitting)
  }

  const {
    form: _form,
    enhance,
    validateForm,
    errors,
    constraints,
    submit,
    submitting,
  } = superForm<InferOutput<S>>(form, formOptions)

  return {
    form: _form,
    enhance,
    validateForm,
    errors,
    constraints,
    submit,
    submitting,
  }
}
