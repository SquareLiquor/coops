import { isBrowser } from '@supabase/ssr'
import { createBrowserClient, createServerClient } from '../clients'

export async function uploadFile(bucket: string = 'products', file: File, path: string) {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.storage.from(bucket).upload(path, file)

  if (error) throw error

  // 업로드 후 public URL 반환
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path)

  return { path: data.path, publicUrl: publicData.publicUrl }
}

export async function deleteFile(bucket: string = 'products', paths: string[]) {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.storage.from(bucket).remove(paths)

  if (error) throw error
}

export async function copyFile(fromBucket: string, toBucket: string, fromPath: string, toPath: string) {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.storage
    .from(fromBucket)
    .copy(fromPath, toPath, { destinationBucket: toBucket })

  if (error) throw error

  const { data: publicData } = supabase.storage.from(toBucket).getPublicUrl(toPath)

  return { path: data.path, publicUrl: publicData.publicUrl }
}
