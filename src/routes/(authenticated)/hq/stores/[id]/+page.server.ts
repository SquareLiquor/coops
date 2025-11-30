import { isAppError } from '$lib/errors'
import { storeDataToUpdateInput, StoreUpdateSchema } from '$lib/schemas'
import { getStoreById, updateStore } from '$lib/services/stores.service'
import { error, fail } from '@sveltejs/kit'
import { message, superValidate, type ErrorStatus } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const { store } = await getStoreById(params.id)

  if (!store) {
    throw error(404, '매장을 찾을 수 없습니다.')
  }

  const storeInput = storeDataToUpdateInput(store)
  const form = await superValidate(storeInput, valibot(StoreUpdateSchema), { errors: false })

  return {
    store,
    form,
  }
}

export const actions: Actions = {
  update: async ({ request }) => {
    const form = await superValidate(request, valibot(StoreUpdateSchema))

    console.log(form)
    if (!form.valid) return fail(400, { form })

    try {
      await updateStore(form.data)

      return { form }
    } catch (error) {
      if (isAppError(error)) {
        return message(form, error.message, { status: error.status as ErrorStatus })
      }

      return message(form, '매장 수정 중 오류가 발생했습니다.', { status: 500 })
    }
  },
}
