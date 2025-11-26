import { createBrowserClient, createServerClient } from '$lib/database'
import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import { isBrowser } from '@supabase/ssr'
import type { CreateCoopHookContext } from '../createCoop.context'

/**
 * copy product images
 * copy product
 */
const createProduct = async (context: CreateCoopHookContext, shared: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { coop } = context
  const { storeId, name, categoryId, salesPrice, description } = coop || {}
  const { originId, capacity, sellUnit, purchaseUnit, purchaseQty } = coop!.product || {}

  const { data: copiedData, error: copiedError } = await supabase
    .from('products')
    .insert([
      {
        store_id: storeId,
        origin_id: originId,
        category_id: categoryId,
        name,
        description,
        price: salesPrice,
        capacity_text: capacity,
        sell_unit_text: sellUnit,
        purchase_unit: purchaseUnit,
        purchase_qty: purchaseQty,
        initial_stock: 0,
        active: true,
      },
    ])
    .select()
    .maybeSingle()

  if (copiedError) throw new SupabaseError('Failed to copy product')

  // shared state에 productId 저장
  shared.set('productId', copiedData?.id)
}

const deleteProduct = async (context: CreateCoopHookContext, shared: any) => {
  const supabase = createServerClient()

  // shared state에서 복사된 productId 가져오기
  const productId = shared.get('productId')

  if (!productId) return

  const { data, error } = await supabase.from('products').delete().eq('id', productId)

  if (error) throw new SupabaseError('Failed to delete product during cleanup')
}

export const createProductHook: HookContext<CreateCoopHookContext> = {
  hook: createProduct,
  cleanup: deleteProduct,
}
