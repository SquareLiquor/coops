import type { ImageInput, ProductCreateInput } from '$lib/schemas'

export interface CreateProductHookContext {
  product?: ProductCreateInput
  productId?: string
  images?: ImageInput[]
}
