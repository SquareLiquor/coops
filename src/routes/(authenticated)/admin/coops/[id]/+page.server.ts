import { toCoopUpdateInputFromCoopEntity } from '$lib/converters/coop.converter'
import { isAppError } from '$lib/errors'
import { CoopUpdateSchema } from '$lib/schemas'
import { getCategories } from '$lib/services/categories.service'
import { updateCoopImages } from '$lib/services/coopImages.service'
import { getCoopById, updateCoop } from '$lib/services/coops.service'
import { updateProduct } from '$lib/services/products.service'
import { SalesStatus, UnitType } from '$lib/types'
import { error, fail } from '@sveltejs/kit'
import { message, superValidate, type ErrorStatus } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, parent }) => {
  const { store } = await parent()
  const { coop } = await getCoopById(params.id)

  if (!coop) {
    throw error(404, '공동구매를 찾을 수 없습니다.')
  }

  const coopInput = toCoopUpdateInputFromCoopEntity(coop)
  const form = await superValidate(coopInput, valibot(CoopUpdateSchema), { errors: false })
  const { categories } = await getCategories(coop.storeId)
  const unitTypes = [...Object.values(UnitType)]
  const salesStatuses = [...Object.values(SalesStatus)]

  return {
    coop,
    form,
    categories,
    unitTypes,
    salesStatuses,
  }
}

export const actions: Actions = {
  update: async ({ request, params, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(CoopUpdateSchema))
    const { id, name, description, salesPrice, storeId, categoryId, product, images } = form.data

    if (!form.valid) return fail(400, { form })

    try {
      await updateCoop(form.data)
      await updateCoopImages(id, images)
      await updateProduct({
        ...product,
        name,
        description,
        price: salesPrice,
        storeId,
        categoryId,
        images: [],
        active: true,
      })

      return { form }
    } catch (error) {
      if (isAppError(error)) {
        return message(form, error.message, { status: error.status as ErrorStatus })
      }

      return message(form, '공동구매 수정 중 오류가 발생했습니다.', { status: 500 })
    }
  },
}
