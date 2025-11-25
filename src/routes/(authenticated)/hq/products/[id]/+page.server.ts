import { getCategories, getProductById, updateProduct, updateProductImages } from '$lib/database'
import { isAppError } from '$lib/errors'
import { productDataToUpdateInput, ProductUpdateSchema } from '$lib/schemas'
import { UnitType } from '$lib/types'
import { error, fail } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const { product } = await getProductById(params.id)

  if (!product) {
    throw error(404, '상품을 찾을 수 없습니다.')
  }

  const productInput = productDataToUpdateInput(product)
  const form = await superValidate(productInput, valibot(ProductUpdateSchema), { errors: false })
  const { categories } = await getCategories(product.storeId)
  const unitTypes = [...Object.values(UnitType)]

  return {
    product: product,
    form,
    categories,
    unitTypes,
  }
}

export const actions: Actions = {
  // 상품 수정
  update: async ({ request, params, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(ProductUpdateSchema))
    const { id: productId, images } = form.data

    if (!form.valid) return fail(400, { form })

    try {
      await updateProduct(form.data)
      await updateProductImages(productId, images)

      return { form }
    } catch (err) {
      if (isAppError(err)) {
        err.errorHandler()
      }
      return setError(form, '상품 수정 중 오류가 발생했습니다.')
    }
  },
}
