import { createBrowserClient } from '$lib/database/clients/browser'
import { createServerClient } from '$lib/database/clients/server'
import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import { isBrowser } from '@supabase/ssr'
import type { CreateProductHookContext } from '../createProduct.context'

const createProductImages = async ({ productId, images }: CreateProductHookContext, shared: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('product_images').insert([
    ...images!.map((image, index) => ({
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
