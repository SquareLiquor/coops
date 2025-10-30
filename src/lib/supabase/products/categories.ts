import { categoryDataConvert } from '$lib/converters/productConverter'
import * as v from 'valibot'
import { createServerClient } from '../clients/server'

export const categorySchema = v.object({
  id: v.optional(v.string()),
  store_id: v.string(),
  name: v.string(),
})

export type CategoryInput = v.InferInput<typeof categorySchema>

const { convert, convertAll } = categoryDataConvert()

export const getCategories = async (store_id: string | undefined) => {
  if (!store_id) return { categories: [] }

  const supabase = createServerClient()

  const { data, error } = await supabase.from('categories').select('*').eq('store_id', store_id)

  if (error) return { categories: [] }
  return { categories: convertAll(data) }
}

export const createCategory = async ({ name, store_id }: Pick<CategoryInput, 'name' | 'store_id'>) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('categories')
    .insert({
      store_id,
      name,
    })
    .select()
    .maybeSingle()

  if (error) throw error

  return { category: convert(data) }
}

export const deleteCategory = async ({ id }: Pick<CategoryInput, 'id'>) => {
  const supabase = createServerClient()

  const response = await supabase.from('categories').delete().eq('id', id)
}
