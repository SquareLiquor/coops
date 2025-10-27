import { ProductsFilterSchema as FilterSchema } from '$lib/schemas'
import type { Actions, ServerLoad } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'

export const load: ServerLoad = async ({ parent, locals: { supabase } }) => {
  const { store } = await parent()
  const initialFilterData = {
    store_id: store.id,
  }
  const filterForm = await superValidate(initialFilterData, valibot(FilterSchema))

  return {
    filterForm,
  }
}

export const actions: Actions = {
  fetch: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(FilterSchema))
    const { store_id, category_id, product_name, status, date_from, date_to } = form.data

    console.log(form)
    if (!form.valid) return { form }

    const query = supabase
      .from('store_product_view')
      .select('*', { count: 'exact' })
      .eq('store_id', store_id)
      .order('created_at', { ascending: false })

    if (category_id) query.eq('category_id', category_id)
    if (product_name) query.ilike('name', `%${product_name}%`)
    if (status) query.eq('status', status)
    if (date_from) query.gte('created_at', date_from)
    if (date_to) query.lte('created_at', date_to)

    const { data } = await query

    console.log(data)

    return {
      form,
      products: data ?? [],
    }
  },
  create: async ({ request, locals: { supabase } }) => {},
  update: async ({ request, locals: { supabase } }) => {},
  delete: async ({ request, locals: { supabase } }) => {},
}
