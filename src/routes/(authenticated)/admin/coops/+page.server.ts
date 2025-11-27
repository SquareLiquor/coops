import { getCategories, getCoopsByStore } from '$lib/database'
import { CoopsFilterSchema, getInitialCoopsFilterValues as getInitialFilter } from '$lib/schemas'
import { SalesStatus } from '$lib/types'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

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

    console.log(form)
    const { coops, pagination } = await getCoopsByStore(form.data)

    return {
      form,
      coops,
      pagination,
    }
  },
}
