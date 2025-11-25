import { createProduct, getCategories } from '$lib/database'
import { isAppError } from '$lib/errors'
import { createInitialProductValues, ProductCreateSchema } from '$lib/schemas'
import { createProductHook } from '$lib/services/hooks'
import { UnitType } from '$lib/types'
import { fail } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  const { store } = await parent()

  const initialProductValues = createInitialProductValues(store!.id)
  const form = await superValidate(initialProductValues, valibot(ProductCreateSchema), { errors: false })

  const { categories } = await getCategories(store!.id)
  const unitTypes = [...Object.values(UnitType)]

  return { form, categories, unitTypes }
}

export const actions: Actions = {
  create: async ({ request }) => {
    const form = await superValidate(request, valibot(ProductCreateSchema))

    if (!form.valid) return fail(400, { form })

    try {
      const { data } = await createProduct(form.data)
      await createProductHook.runAfter({ product: form.data, productId: data.id, images: form.data.images })

      return { form }
    } catch (error) {
      if (isAppError(error)) error.errorHandler()

      await createProductHook.runCleanup({})
      return setError(form, '상품 등록 중 오류가 발생했습니다.')
    }
  },
}
