import type { HookContext } from '$lib/services/hooks/hooksManager'
import { createProductImages as createProductImagesService } from '$lib/services/products.service'
import type { CreateProductHookContext } from '../createProduct.context'

const createProductImages = async ({ productId, images }: CreateProductHookContext, shared: any) => {
  if (!productId || !images || images.length === 0) return

  // service layer에서 모든 비즈니스 로직 처리
  await createProductImagesService(productId, images)

  shared.set('productId', productId)
}

export const createProductImagesHook: HookContext<CreateProductHookContext> = {
  hook: createProductImages,
}
