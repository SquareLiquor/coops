import type { HookContext } from '$lib/services/hooks/hooksManager'
import { deleteProduct as deleteProductService } from '$lib/services/products.service'
import type { CreateProductHookContext } from '../createProduct.context'

const deleteProduct = async (shared: any) => {
  const productId = shared.get('productId')
  if (!productId) return

  await deleteProductService(productId)
}

export const deleteProductHook: HookContext<CreateProductHookContext> = {
  cleanup: deleteProduct,
}
