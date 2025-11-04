import { coopDataConverter } from '$lib/converters'
import { CoopsFilterSchema, getInitialProductsFilterValues } from '$lib/schemas'
import { getCategories } from '$lib/supabase'
import { SalesStatus } from '$lib/types'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

const { convert, convertAll } = coopDataConverter()

const coopSelectQuery = `
  *,
  store:store_id(*),
  product:product_id(*, product_images(*))
  category:category_id(*)
`

export const load: PageServerLoad = async ({ parent }) => {
  const { store } = await parent()

  const initialFilterValues = getInitialProductsFilterValues(store?.id)
  const filterForm = await superValidate(initialFilterValues, valibot(CoopsFilterSchema))

  const { categories } = await getCategories(store?.id)

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
    const { store_id, category_id, name, status, date_from, date_to } = form.data

    if (!form.valid) return { form }

    const query = supabase
      .from('coops')
      .select(coopSelectQuery)
      .eq('store_id', store_id)
      .order('created_at', { ascending: false })

    if (category_id) query.eq('category_id', category_id)
    if (name) query.ilike('name', `%${name}%`)
    if (status) query.eq('status', status)
    if (date_from) query.gte('created_at', date_from)
    if (date_to) query.lte('created_at', date_to)

    const { data, error } = await query

    return {
      form,
      coops: data ? convertAll(data) : [],
    }
  },
}
