import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createBrowserClient } from '$lib/supabase/clients/browser'
import { createServerClient } from '$lib/supabase/clients/server'
import type { CreateProductHookContext } from '$lib/types'
import { isBrowser } from '@supabase/ssr'

const createProductImages = async ({ product, productId }: CreateProductHookContext, shared: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { images = [] } = product || {}
  const { data, error } = await supabase.from('product_images').insert([
    ...images.map((image, index) => ({
      product_id: productId,
      url: image.url,
      path: image.path,
      representative: image.representative,
      sort_order: index,
    })),
  ])

  if (error) throw new SupabaseError('PRODUCT_IMAGE_CREATION_FAILED', { details: { error: error.message } })

  shared.set('productId', productId)
}

export const createProductImagesHook: HookContext<CreateProductHookContext> = {
  hook: createProductImages,
}
