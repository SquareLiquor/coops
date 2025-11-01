import { isBrowser } from '@supabase/ssr'
import { createBrowserClient, createServerClient } from '../clients'

export async function uploadFile(bucket: string = 'products', file: File, path: string) {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.storage.from(bucket).upload(path, file)

  if (error) throw error

  // 업로드 후 public URL 반환
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path)

  return publicUrl
}

export async function deleteFile(bucket: string = 'products', path: string) {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.storage.from(bucket).remove([path])

  if (error) throw error
}
