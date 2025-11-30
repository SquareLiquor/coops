import { isBrowser } from '@supabase/ssr'
import * as v from 'valibot'
import { createBrowserClient } from '../clients/browser'
import { createServerClient } from '../clients/server'

export const categorySchema = v.object({
  id: v.optional(v.string()),
  store_id: v.string(),
  name: v.string(),
})

export type CategoryInput = v.InferInput<typeof categorySchema>

export const getCategories = async (storeId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('name', { ascending: true })

  if (error) return { categories: [] }
  return { categories: data }
}

export const createCategory = async ({ name, store_id }: Pick<CategoryInput, 'name' | 'store_id'>) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('categories')
    .insert({
      store_id,
      name,
    })
    .select()
    .maybeSingle()

  if (error) throw error

  return { category: data }
}

export const deleteCategory = async ({ id }: Pick<CategoryInput, 'id'>) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const response = await supabase.from('categories').delete().eq('id', id)
}
