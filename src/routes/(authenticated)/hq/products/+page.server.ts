import { toProductEntities } from '$lib/converters/product.converter'
import { getCategories, getProducts } from '$lib/database'
import { ProductsFilterSchema as FilterSchema, getInitialProductsFilterValues as getInitialFilter } from '$lib/schemas'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent, locals: { supabase } }) => {
  const { store } = await parent()

  const initialFilter = getInitialFilter(store!.id)
  const filterForm = await superValidate(initialFilter, valibot(FilterSchema))

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

    if (!form.valid) return { form }

    const { products } = await getProducts(form.data)

    return {
      form,
      products: toProductEntities(products),
    }
  },
}
