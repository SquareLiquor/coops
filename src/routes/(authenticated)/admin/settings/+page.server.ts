import { isAppError } from '$lib/errors'
import { storeDataToUpdateInput, StoreUpdateSchema } from '$lib/schemas'
import { getStoreById, updateStore } from '$lib/services/stores.service'
import { fail, redirect } from '@sveltejs/kit'
import { message, superValidate, type ErrorStatus } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  const { store } = await parent()
  
  if (!store) {
    throw redirect(303, '/auth/unauthorized')
  }

  const { store: storeData } = await getStoreById(store.id)
  
  console.log(store, storeData)
  if (!storeData) {
    throw redirect(303, '/admin')
  }

  const storeInput = storeDataToUpdateInput(storeData)
  const form = await superValidate(storeInput, valibot(StoreUpdateSchema), { errors: false })

  return {
    store: storeData,
    form,
  }
}

export const actions: Actions = {
  update: async ({ request }) => {
    const form = await superValidate(request, valibot(StoreUpdateSchema))

    if (!form.valid) return fail(400, { form })

    try {
      const {store} = await updateStore(form.data)

      return { form }
    } catch (error) {
      if (isAppError(error)) {
        return message(form, error.message, { status: error.status as ErrorStatus })
      }

      return message(form, '매장 수정 중 오류가 발생했습니다.', { status: 500 })
    }
  },
}
