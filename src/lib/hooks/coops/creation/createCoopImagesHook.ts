import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import type { ImageInput } from '$lib/schemas/common/image'
import { copyFile, createBrowserClient, createServerClient, deleteFile } from '$lib/supabase'
import type { CreateCoopHookContext } from '$lib/types'
import { isBrowser } from '@supabase/ssr'

const createCoopImages = async ({ images }: CreateCoopHookContext, shared: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  if (images!.length === 0) return { data: [] }

  const coopId = shared.get('coopId')
  if (!coopId) return

  const imagesToCopy = images!.filter((image: ImageInput) => !image.new && image.use)
  const imagesToNew = images!.filter((image: ImageInput) => image.new && image.use)

  const imagesCopied: ImageInput[] = []
  await Promise.all(
    imagesToCopy.map(async (image: ImageInput) => {
      const { path, publicUrl } = await copyFile('products', 'coops', image.path, image.path)
      imagesCopied.push({
        ...image,
        url: publicUrl,
        path,
      })
    })
  )

  shared.set('coopImages', [...imagesToNew, ...imagesCopied])

  const { data, error } = await supabase
    .from('coop_images')
    .insert(
      [...imagesToNew, ...imagesCopied]!.map((image: ImageInput) => ({
        coop_id: coopId,
        url: image.url,
        path: image.path,
        representative: image.representative,
        sort_order: image.sortOrder,
      }))
    )
    .select()

  if (error) throw new SupabaseError('COOP_IMAGE_CREATION_FAILED', { details: { error: error.message } })
}

const deleteCoopImages = async (context: CreateCoopHookContext, shared: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const coopImages = shared.get('coopImages')
  if (!coopImages) return

  const paths: string[] = coopImages.map((image: ImageInput) => image.path)

  await deleteFile('coops', paths)
}

export const createCoopImagesHook: HookContext<CreateCoopHookContext> = {
  hook: createCoopImages,
  cleanup: deleteCoopImages,
}
