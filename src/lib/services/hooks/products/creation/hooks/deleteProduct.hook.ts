import { createBrowserClient } from '$lib/database/clients/browser'
import { createServerClient } from '$lib/database/clients/server'
import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import { isBrowser } from '@supabase/ssr'
import type { CreateProductHookContext } from '../createProduct.context'

const deleteProduct = async (shared: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const productId = shared.get('productId')
  const { data, error } = await supabase.from('products').delete().eq('id', productId)

  if (error) throw new SupabaseError('PRODUCT_DELETION_FAILED', { details: { error: error.message } })
}

export const deleteProductHook: HookContext<CreateProductHookContext> = {
  cleanup: deleteProduct,
}
