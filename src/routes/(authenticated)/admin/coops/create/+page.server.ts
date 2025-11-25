import { createCoop, getCategories } from '$lib/database'
import { isAppError } from '$lib/errors'
import { CoopCreateSchema, getInitialCoopValues } from '$lib/schemas'
import { createCoopHook } from '$lib/services/hooks'
import { SalesStatus, UnitType } from '$lib/types'
import { fail, type Actions } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms'
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
  create: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(CoopCreateSchema))

    if (!form.valid) return fail(400, { form })

    try {
      const { shared } = await createCoopHook.runBefore({ coop: form.data })

      const { data } = await createCoop(form.data, shared.get('productId'))
      shared.set('coopId', data.id)

      await createCoopHook.runAfter({ images: form.data.images })

      return { form }
    } catch (error) {
      console.error(error)
      if (isAppError(error)) error.errorHandler()

      await createCoopHook.runCleanup({})
      return setError(form, '판매 상품 등록 중 오류가 발생했습니다.')
    }
  },
}
