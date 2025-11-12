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
  storeId: string | undefined
  dateFrom: string | undefined
  dateTo: string | undefined
  pagination: Record<string, any>
}
