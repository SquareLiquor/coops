import type { CoopCreateInput, ProductInputForCoop } from '$lib/schemas'
import type { ProductCreateInput } from '$lib/schemas/product/product'
import type { SigninFormData, SignupFormData } from './form'

export interface SignupHookContext {
  signupData: SignupFormData
  userId?: string | null
}

export interface SigninHookContext {
  signinData: SigninFormData
  userId?: string | null
}

export interface ApproveRequestHookContext {
  storeId: string
  userId: string
  originStatus?: 'pending' | 'approved' | 'rejected'
}

export interface CreateProductHookContext {
  product?: ProductCreateInput
  productId?: string
}

export interface CreateCoopHookContext {
  coop?: CoopCreateInput
  product?: ProductInputForCoop
  productId?: string
}
