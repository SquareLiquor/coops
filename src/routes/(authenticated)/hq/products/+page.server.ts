import { productDataConverter } from '$lib/converters'
import { ProductsFilterSchema as FilterSchema, getInitialProductsFilterValues } from '$lib/schemas'
import { getCategories } from '$lib/supabase'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

const { convertAll } = productDataConverter()

const productSelectQuery = `
  *,
  category:category_id(*)
`

export const load: PageServerLoad = async ({ parent, locals: { supabase } }) => {
  const { store } = await parent()

  const initialFilterValues = getInitialProductsFilterValues(store?.id)
  const filterForm = await superValidate(initialFilterValues, valibot(FilterSchema))

  const { categories } = await getCategories(store?.id)
  const statuses = [{ code: undefined, label: '전체' }]

  return {
    filterForm,
    categories,
    statuses,
  }
}

export const actions: Actions = {
  fetch: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(FilterSchema))
    const { store_id, category_id, product_name, status, date_from, date_to } = form.data

    if (!form.valid) return { form }

    const query = supabase
      .from('products')
      .select(productSelectQuery)
      .eq('store_id', store_id)
      .order('created_at', { ascending: false })

    if (category_id) query.eq('category_id', category_id)
    if (product_name) query.ilike('name', `%${product_name}%`)
    if (status) query.eq('status', status)
    if (date_from) query.gte('created_at', date_from)
    if (date_to) query.lte('created_at', date_to)

    const { data } = await query

    return {
      form,
      products: data ? convertAll(data) : [],
    }
  },
  create: async ({ request, locals: { supabase } }) => {},
  update: async ({ request, locals: { supabase } }) => {},
  delete: async ({ request, locals: { supabase } }) => {},
}
