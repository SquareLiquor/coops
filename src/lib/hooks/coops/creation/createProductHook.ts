import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createBrowserClient, createServerClient } from '$lib/supabase'
import type { CreateCoopHookContext } from '$lib/types'
import { isBrowser } from '@supabase/ssr'

/**
 * copy product images
 * copy product
 */
const createProduct = async (context: CreateCoopHookContext, shared: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { coop } = context
  const { storeId, name, categoryId, salesPrice, description } = coop || {}
  const { originId, unit, quantityPerUnit } = coop!.product || {}

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
        unit,
        initial_stock: 0,
        quantity_per_unit: quantityPerUnit,
        active: true,
      },
    ])
    .select()
    .maybeSingle()

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
