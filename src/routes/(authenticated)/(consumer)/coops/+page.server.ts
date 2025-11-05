import { coopDataConverter } from '$lib/converters'
import { getCategories } from '$lib/supabase'
import type { Actions, PageServerLoad } from './$types'

const { convertAll } = coopDataConverter()

const coopsSelectQuery = `
  *,
  product:product_id(*, images:product_images(*)),
  category:category_id(*)
`

export const load: PageServerLoad = async ({ parent, locals: { supabase } }) => {
  const { store } = await parent()
  const { id } = store

  const { data, error } = await supabase
    .from('coops')
    .select(coopsSelectQuery)
    .eq('store_id', id)
    .eq('status', 'ONGOING')
  const { categories } = await getCategories(store?.id)

  return {
    coops: convertAll(data ?? []),
    categories: categories ?? [],
  }
}

export const actions: Actions = {
  default: async ({ locals, params }) => {},
}
