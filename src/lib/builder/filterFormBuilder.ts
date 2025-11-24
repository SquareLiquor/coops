import { asyncSuperFormSubmit, debounce } from '$lib/utils'
import { isBrowser } from '@supabase/ssr'
import type { ActionResult } from '@sveltejs/kit'
import { superForm, type FormOptions } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { BaseSchema, InferOutput } from 'valibot'
import type { BuilderSuperFormParamaters } from '.'

export const buildFilterForm = <S extends BaseSchema<any, any, any>>(params: BuilderSuperFormParamaters<S>) => {
  const { form, schema, changeHandler = {}, submitHandler = {}, resultHandler = {}, options = {} } = params
  const { beforeChange } = changeHandler
  const { beforeSubmit } = submitHandler
  const { handleSuccess, handleFailure } = resultHandler
  const { dataType = 'json', resetForm = false, useClientValidation = false } = options

  const formOptions: FormOptions<InferOutput<S>, any, InferOutput<S>> = {
    validators: valibot(schema),
    dataType,
    resetForm,
    invalidateAll: false,
    onChange: async (event: any) => {
      beforeChange && beforeChange()

      const { target } = event
      if ((target as HTMLInputElement)?.type === 'text') debouncedSubmit()
      else await submit()
    },
    onSubmit: async ({ cancel }) => {
      !isBrowser() && cancel()
      beforeSubmit && beforeSubmit()
    },
    onResult: async ({ result }: { result: ActionResult }) => {
      if (result?.type === 'success') handleSuccess && handleSuccess(result)
      if (result?.type === 'failure') handleFailure && handleFailure(result)
    },
  }

  let submit = async () => await asyncSuperFormSubmit(_submit, _submitting)
  if (useClientValidation) {
    submit = async () => {
      const result = await _validateForm({ update: true })
      if (result.valid) await asyncSuperFormSubmit(_submit, _submitting)
    }
  }
  const debouncedSubmit = debounce(submit, 300)

  const {
    submit: _submit,
    submitting: _submitting,
    validateForm: _validateForm,
    ...properties
  } = superForm<InferOutput<S>>(form, formOptions)

  return {
    submit: _submit,
    submitting: _submitting,
    validateForm: _validateForm,
    asyncSubmit: async () => await asyncSuperFormSubmit(_submit, _submitting),
    debouncedSubmit,
    ...properties,
  }
}
