import type { SigninFormData, SignupFormData } from './form'

export interface SignupHookContext {
  signupData: SignupFormData
  userId?: string | null
}

export interface SigninHookContext {
  signinData: SigninFormData
  userId?: string | null
}
