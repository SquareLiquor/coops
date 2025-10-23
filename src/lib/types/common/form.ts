export interface SignupFormData {
  email: string
  name?: string
  phone1?: string
  phone2?: string
  phone3?: string
  password?: string
  confirmPassword?: string
  storeId?: string
  storeType?: string
}

export interface SigninFormData {
  email: string
  password: string
}

export type FieldErrorMap = Record<string, string>

export interface FormValidationError {
  field: FieldErrorMap
}
export type FormError = string | FormValidationError | undefined

export interface ApprovalRequestSearchFormData {
  status: string | undefined
  store_id: string | undefined
  date_from: string | undefined
  date_to: string | undefined
  pagination: Record<string, any>
}
