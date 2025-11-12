import { coopDataConverter } from '$lib/converters'
import { CoopsFilterSchema, getInitialCoopsFilterValues as getInitialFilter } from '$lib/schemas'
import { getCategories } from '$lib/supabase'
import { SalesStatus } from '$lib/types'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

const { convert, convertAll } = coopDataConverter()

const coopSelectQuery = `
  *,
  store:store_id(*),
  images:coop_images(*),
  product:product_id(*),
  category:category_id(*)
`

export const load: PageServerLoad = async ({ parent }) => {
  const { store } = await parent()

  const initialFilter = getInitialFilter(store!.id)
  const filterForm = await superValidate(initialFilter, valibot(CoopsFilterSchema))

  const { categories } = await getCategories(store!.id)

  const salesStatuses = [{ code: undefined, label: '전체' }, ...Object.values(SalesStatus)]

  return {
    filterForm,
    categories,
    salesStatuses,
  }
}

export const actions: Actions = {
  fetch: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(CoopsFilterSchema))
    if (!form.valid) return { form }

    const { storeId, categoryId, name, status, dateFrom, dateTo } = form.data
    const query = supabase
      .from('coops')
      .select(coopSelectQuery)
      .eq('store_id', storeId)
      .order('sales_date', { ascending: false })

    if (categoryId) query.eq('category_id', categoryId)
    if (name) query.ilike('name', `%${name}%`)
    if (status) query.eq('status', status)
    if (dateFrom) query.gte('sales_date', dateFrom)
    if (dateTo) query.lte('sales_date', dateTo)

    const { data, error } = await query

    console.log(data)
    return {
      form,
      coops: data ? convertAll(data) : [],
    }
  },
}
