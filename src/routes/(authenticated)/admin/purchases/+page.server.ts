import { getInitialPurchasesFilterValues as getInitialFilter, PurchasesFilterSchema } from '$lib/schemas'
import { getCategories } from '$lib/services/categories.service'
import { getPurchasesForStore } from '$lib/services/purchases.service'
import { PurchaseStatus } from '$lib/types'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  const { store } = await parent()

  const initialFilter = getInitialFilter(store!.id)
  const filterForm = await superValidate(initialFilter, valibot(PurchasesFilterSchema))

  const { categories } = await getCategories(store!.id)
  const purchaseStatuses = [{ code: undefined, label: '전체' }, ...Object.values(PurchaseStatus)]

  return {
    filterForm,
    categories,
    purchaseStatuses,
  }
}

export const actions: Actions = {
  fetch: async ({ request }) => {
    const form = await superValidate(request, valibot(PurchasesFilterSchema))
    if (!form.valid) return { form }

    try {
      const { purchases, pagination } = await getPurchasesForStore(form.data)

      return { form, purchases, pagination }
    } catch (error) {
      return { form }
    }
  },
  create: async ({ request }) => {},
}
