import { isAppError } from '$lib/errors'
import { CoopCreateSchema, getInitialCoopValues } from '$lib/schemas'
import { getCategories } from '$lib/services/categories.service'
import { createCoop } from '$lib/services/coops.service'
import { createCoopHook } from '$lib/services/hooks'
import { SalesStatus, UnitType } from '$lib/types'
import { fail, type Actions } from '@sveltejs/kit'
import { message, superValidate, type ErrorStatus } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  const { store, hqStore } = await parent()

  const initialCoopValues = getInitialCoopValues(store!.id)
  const form = await superValidate(initialCoopValues, valibot(CoopCreateSchema), { errors: false })

  const { categories } = await getCategories(store!.id)
  const unitTypes = [...Object.values(UnitType)]
  const salesStatuses = [...Object.values(SalesStatus)]

  return { form, categories, unitTypes, salesStatuses, hqStore }
}

export const actions: Actions = {
  create: async ({ request }) => {
    const form = await superValidate(request, valibot(CoopCreateSchema))

    if (!form.valid) return fail(400, { form })

    try {
      const { shared } = await createCoopHook.runBefore({ coop: form.data })

      const { coop } = await createCoop(form.data, shared.get('productId'))
      shared.set('coopId', coop?.id)

      await createCoopHook.runAfter({ images: form.data.images })

      return { form }
    } catch (error) {
      await createCoopHook.runCleanup({})

      if (isAppError(error)) {
        return message(form, error.message, { status: error.status as ErrorStatus })
      }

      return message(form, '판매 상품 등록 중 오류가 발생했습니다.', { status: 500 })
    }
  },
}
