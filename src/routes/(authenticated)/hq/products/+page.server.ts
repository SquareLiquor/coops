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

  const initialFilterValues = getInitialProductsFilterValues(store!.id)
  const filterForm = await superValidate(initialFilterValues, valibot(FilterSchema))

  const { categories } = await getCategories(store!.id)
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
    const { storeId, categoryId, productName, status, dateFrom, dateTo } = form.data

    if (!form.valid) return { form }

    const query = supabase
      .from('products')
      .select(productSelectQuery)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (categoryId) query.eq('category_id', categoryId)
    if (productName) query.ilike('name', `%${productName}%`)
    if (status) query.eq('status', status)
    if (dateFrom) query.gte('created_at', dateFrom)
    if (dateTo) query.lte('created_at', dateTo)

    const { data } = await query

    return {
      form,
      products: data ? convertAll(data) : [],
    }
  },
}
