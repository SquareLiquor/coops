import type { SuperValidated } from 'sveltekit-superforms'
import type { BaseSchema, InferOutput } from 'valibot'

export * from './filterFormBuilder'
export * from './formBuilder'

export type BuilderSuperFormParamaters<S extends BaseSchema<any, any, any>> = {
  form: SuperValidated<InferOutput<S>>
  schema: S
  changeHandler?: {
    beforeChange?: () => void
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
