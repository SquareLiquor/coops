import { coopDataConverter } from '$lib/converters/coopsConverter'
import { CoopsFilterSchema } from '$lib/schemas'
import { getCategories } from '$lib/supabase'
import { SalesStatus } from '$lib/types'
import type { Actions, ServerLoad } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'

const { convert, convertAll } = coopDataConverter()

const coopSelectQuery = `
  *,
  store:store_id(*),
  product:product_id(*, category:category_id(*), product_images(*))
`

export const load: ServerLoad = async ({ parent }) => {
  const { store } = await parent()

  const initialFilterValues = {
    store_id: store.id,
  }
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

    console.log('coop selectd data', data)
    return {
      form,
      coops: data ? convertAll(data) : [],
    }
  },
}
