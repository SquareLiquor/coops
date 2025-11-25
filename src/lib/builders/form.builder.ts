import type { ActionResult } from '@sveltejs/kit'
import { superForm, type FormOptions } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { BaseSchema, InferOutput } from 'valibot'
import type { BuilderSuperFormParamaters } from './type'

export const buildForm = <S extends BaseSchema<any, any, any>>(params: BuilderSuperFormParamaters<S>) => {
  const { form, schema, resultHandler = {}, options = {} } = params
  const { handleSuccess, handleFailure } = resultHandler
  const { dataType = 'json', resetForm = false, useClientValidation = false } = options

  const formOptions: FormOptions<InferOutput<S>, any, InferOutput<S>> = {
    validators: valibot(schema),
    dataType,
    resetForm,
    invalidateAll: false,
    onResult: async ({ result }: { result: ActionResult }) => {
      if (result?.type === 'success') handleSuccess && handleSuccess(result)
      if (result?.type === 'failure') handleFailure && handleFailure(result)
    },
  }

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
    ...properties,
  }
}
