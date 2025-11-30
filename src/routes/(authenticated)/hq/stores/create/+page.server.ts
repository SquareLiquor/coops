import { isAppError } from '$lib/errors'
import { createInitialStoreValues, StoreCreateSchema } from '$lib/schemas'
import { createStore } from '$lib/services/stores.service'
import { fail } from '@sveltejs/kit'
import { message, superValidate, type ErrorStatus } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const initialStoreValues = createInitialStoreValues()
  const form = await superValidate(initialStoreValues, valibot(StoreCreateSchema), { errors: false })

  return { form }
}

export const actions: Actions = {
  create: async ({ request }) => {
    const form = await superValidate(request, valibot(StoreCreateSchema))

    if (!form.valid) return fail(400, { form })

    try {
      await createStore(form.data)

      return { form }
    } catch (error) {
      if (isAppError(error)) {
        return message(form, error.message, { status: error.status as ErrorStatus })
      }

      return message(form, '매장 등록 중 오류가 발생했습니다.', { status: 500 })
    }
  },
}
