import { StoresFilterSchema } from '$lib/schemas'
import { getStores } from '$lib/services/stores.service'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const filterForm = await superValidate(valibot(StoresFilterSchema))

  return {
    filterForm,
  }
}

export const actions: Actions = {
  fetch: async ({ request }) => {
    const form = await superValidate(request, valibot(StoresFilterSchema))

    if (!form.valid) {
      return { form }
    }

    const { stores, pagination } = await getStores(form.data)

    return {
      form,
      stores,
      pagination,
    }
  },
}
