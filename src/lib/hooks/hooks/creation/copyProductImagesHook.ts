import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import type { OriginProductImageInput } from '$lib/schemas'
import { createServerClient } from '$lib/supabase'
import type { CreateCoopHookContext } from '$lib/types'

const copyProductImages = async ({ product }: CreateCoopHookContext, shared: any) => {
  const supabase = createServerClient()

  const { images = [] } = product || {}
  if (images.length === 0) return { data: [] }

  const productId = shared.get('productId')
  if (!productId) return

  const { data, error } = await supabase
    .from('product_images')
    .insert(
      images.map((image: OriginProductImageInput) => ({
        product_id: productId,
        url: image.url,
        representative: image.representative,
        sort_order: image.sort_order,
      }))
    )
    .select()

  if (error) {
    throw new SupabaseError('Failed to copy product images')
  }
}

const deleteProductImages = async (context: CreateCoopHookContext, shared: any) => {
  const supabase = createServerClient()

  const productId = shared.get('productId')
  if (!productId) return

  const { data, error } = await supabase.from('product_images').delete().eq('product_id', productId)

  if (error) throw new SupabaseError('Failed to delete product images during cleanup')
}

export const copyProductImagesHook: HookContext<CreateCoopHookContext> = {
  hook: copyProductImages,
  cleanup: deleteProductImages,
}
