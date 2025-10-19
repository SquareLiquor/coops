export interface SignupFormData {
  email: string
  name?: string
  phone1?: string
  phone2?: string
  phone3?: string
  password?: string
  confirmPassword?: string
  storeId?: string
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
