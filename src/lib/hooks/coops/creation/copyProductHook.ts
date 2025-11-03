import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createServerClient } from '$lib/supabase'
import type { CreateCoopHookContext } from '$lib/types'

/**
 * copy product images
 * copy product
 */
const copyProduct = async (context: CreateCoopHookContext, shared: any) => {
  const supabase = createServerClient()

  const { coop, product } = context
  const { store_id, name, sales_price, description } = coop || {}
  const { origin_id, category_id, images = [] } = product || {}

  const { data: copiedData, error: copiedError } = await supabase
    .from('products')
    .insert([
      {
        store_id,
        origin_id,
        category_id,
        name,
        description,
        price: sales_price,
        unit: 'EA',
        initial_stock: 0,
        quantity_per_unit: 1,
        active: true,
      },
    ])
    .select()
    .maybeSingle()

  // shared state에 productId 저장
  shared.set('productId', copiedData?.id)
}

const deleteCopiedProduct = async (context: CreateCoopHookContext, shared: any) => {
  const supabase = createServerClient()

  // shared state에서 복사된 productId 가져오기
  const productId = shared.get('productId')

  if (!productId) return

  const { data, error } = await supabase.from('products').delete().eq('id', productId)

  if (error) throw new SupabaseError('Failed to delete product during cleanup')
}

export const copyProductHook: HookContext<CreateCoopHookContext> = {
  hook: copyProduct,
  cleanup: deleteCopiedProduct,
}
