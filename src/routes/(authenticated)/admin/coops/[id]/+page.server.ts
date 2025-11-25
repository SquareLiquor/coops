import { toCoopEntity } from '$lib/converters/coop.converter'
import { getCategories, getCoopById, updateCoop, updateCoopImages } from '$lib/database'
import { isAppError } from '$lib/errors'
import { coopDataToUpdateInput, CoopUpdateSchema } from '$lib/schemas'
import { SalesStatus, UnitType } from '$lib/types'
import { error, fail } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, parent }) => {
  const { store } = await parent()
  const { coop } = await getCoopById(params.id)

  if (!coop) {
    throw error(404, '공동구매를 찾을 수 없습니다.')
  }

  const coopInput = coopDataToUpdateInput(coop)
  const form = await superValidate(coopInput, valibot(CoopUpdateSchema), { errors: false })
  const { categories } = await getCategories(coop.store_id)
  const unitTypes = [...Object.values(UnitType)]
  const salesStatuses = [...Object.values(SalesStatus)]

  return {
    coop: toCoopEntity(coop),
    form,
    categories,
    unitTypes,
    salesStatuses,
  }
}

export const actions: Actions = {
  update: async ({ request, params, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(CoopUpdateSchema))
    const { id, images } = form.data

    if (!form.valid) return fail(400, { form })

    try {
      await updateCoop(form.data)
      await updateCoopImages(id, images)

      return { form }
    } catch (error) {
      if (isAppError(error)) error.errorHandler()

      return setError(form, '공동구매 수정 중 오류가 발생했습니다.')
    }
  },
}
