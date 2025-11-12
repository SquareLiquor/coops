import type { CoopCreateInput, ImageInput, OrderCreateInput } from '$lib/schemas'
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
  images?: ImageInput[]
}

export interface CreateCoopHookContext {
  coop?: CoopCreateInput
  images?: ImageInput[]
}

export interface CreateOrderHookContext {
  order?: OrderCreateInput
  orderId?: string
}
