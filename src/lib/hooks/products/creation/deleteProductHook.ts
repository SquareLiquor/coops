import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createBrowserClient } from '$lib/supabase/clients/browser'
import { createServerClient } from '$lib/supabase/clients/server'
import type { CreateProductHookContext } from '$lib/types'
import { isBrowser } from '@supabase/ssr'

const deleteProduct = async (shared: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const productId = shared.get('productId')
  const { data, error } = await supabase.from('products').delete().eq('id', productId)

  if (error) throw new SupabaseError('PRODUCT_DELETION_FAILED', { details: { error: error.message } })
}

export const deleteProductHook: HookContext<CreateProductHookContext> = {
  cleanup: deleteProduct,
}
