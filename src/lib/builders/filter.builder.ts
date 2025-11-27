import { asyncSuperFormSubmit, debounce } from '$lib/utils'
import { isBrowser } from '@supabase/ssr'
import type { ActionResult } from '@sveltejs/kit'
import { superForm, type FormOptions } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { BaseSchema, InferOutput } from 'valibot'
import type { BuilderSuperFormParamaters } from './type'

export const buildFilterForm = <S extends BaseSchema<any, any, any>>(params: BuilderSuperFormParamaters<S>) => {
  const { form, schema, changeHandler = {}, submitHandler = {}, resultHandler = {}, options = {} } = params
  const { beforeChange } = changeHandler
  const { beforeSubmit } = submitHandler
  const { handleSuccess, handleFailure } = resultHandler
  const { dataType = 'json', resetForm = false, useClientValidation = false } = options

  // 페이징 상태 객체 (외부에서 $state로 감싸서 사용)
  const pagination = {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  }

  const formOptions: FormOptions<InferOutput<S>, any, InferOutput<S>> = {
    validators: valibot(schema),
    dataType,
    resetForm,
    invalidateAll: false,
    onChange: async (event: any) => {
      beforeChange && beforeChange()

      const { target } = event
      const inputName = (target as HTMLInputElement)?.name

      // 페이지 필드가 아닌 다른 필드가 변경되면 페이지를 1로 리셋
      if (inputName && inputName !== 'page' && inputName !== 'pageSize') {
        _form.update((data) => ({ ...data, page: 1 }))
      }

      if ((target as HTMLInputElement)?.type === 'text') debouncedSubmit()
      else await submit()
    },
    onSubmit: async ({ cancel }) => {
      !isBrowser() && cancel()
      beforeSubmit && beforeSubmit()
    },
    onResult: async ({ result }: { result: ActionResult }) => {
      if (result?.type === 'success') {
        // pagination 정보가 있으면 상태 업데이트
        const paginationData = (result as any).data?.pagination
        if (paginationData) {
          pagination.currentPage = paginationData.page
          pagination.totalPages = paginationData.totalPages
          pagination.totalCount = paginationData.totalCount
        }
        handleSuccess && handleSuccess(result, paginationData)
      }
      if (result?.type === 'failure') {
        // 실패 시 페이징 초기화
        pagination.currentPage = 1
        pagination.totalPages = 1
        pagination.totalCount = 0
        handleFailure && handleFailure(result)
      }
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
    form: _form,
    submit: _submit,
    submitting: _submitting,
    validateForm: _validateForm,
    ...properties
  } = superForm<InferOutput<S>>(form, formOptions)

  return {
    form: _form,
    submit: _submit,
    submitting: _submitting,
    validateForm: _validateForm,
    asyncSubmit: async () => await asyncSuperFormSubmit(_submit, _submitting),
    debouncedSubmit,
    pagination,
    ...properties,
  }
}
