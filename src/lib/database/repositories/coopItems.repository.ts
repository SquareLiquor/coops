import type { ImageInput } from '$lib/schemas'
import { isBrowser } from '@supabase/ssr'
import { createBrowserClient, createServerClient } from '../clients'

export const createCoopImages = async (coopId: string, images: ImageInput[]) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('coop_images')
    .insert(
      images.map((image) => ({
        coop_id: coopId,
        url: image.url,
        path: image.path,
        representative: image.representative,
        sort_order: image.sortOrder,
      }))
    )
    .select()

  if (error) throw error

  return { data }
}

export const updateCoopImages = async (coopId: string, images: ImageInput[]) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { error: deleteError } = await supabase.from('coop_images').delete().eq('coop_id', coopId)

  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('coop_images').insert(
    images
      .filter((image) => image.use)
      .map((image, index) => ({
        coop_id: coopId,
        url: image.url,
        path: image.path,
        representative: image.representative,
        sort_order: index,
      }))
  )

  if (insertError) throw insertError
}

export const deleteCoopImages = async (coopId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { error } = await supabase.from('coop_images').delete().eq('coop_id', coopId)

  if (error) throw error
}
