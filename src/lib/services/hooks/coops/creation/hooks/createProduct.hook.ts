import type { HookContext } from '$lib/services/hooks/hooksManager'
import { copyProductForCoop, deleteProduct as deleteProductService } from '$lib/services/products.service'
import type { CreateCoopHookContext } from '../createCoop.context'

const createProduct = async (context: CreateCoopHookContext, shared: any) => {
  const { coop } = context
  const { storeId, name, categoryId, salesPrice, description } = coop || {}
  const { originId, capacity, sellUnit, purchaseUnit, purchaseQty } = coop!.product || {}

  if (!storeId || !name) return

  // service layer에서 모든 비즈니스 로직 처리
  const { product } = await copyProductForCoop({
    storeId,
    originId,
    categoryId,
    name,
    description,
    price: salesPrice!,
    capacity,
    sellUnit,
    purchaseUnit,
    purchaseQty,
  })

  // shared state에 productId 저장
  shared.set('productId', product?.id)
}

const deleteProduct = async (context: CreateCoopHookContext, shared: any) => {
  const productId = shared.get('productId')
  if (!productId) return

  // service layer에서 정리 로직 처리
  await deleteProductService(productId)
}

export const createProductHook: HookContext<CreateCoopHookContext> = {
  hook: createProduct,
  cleanup: deleteProduct,
}
