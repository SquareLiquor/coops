import { getCategories, getProductById } from '$lib/database'
import { isAppError } from '$lib/errors'
import { productDataToUpdateInput, ProductUpdateSchema, type ImageInput, type ProductUpdateInput } from '$lib/schemas'
import { UnitType } from '$lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'
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
    product,
    form,
    categories,
    unitTypes,
  }
}

export const actions: Actions = {
  // 상품 수정
  update: async ({ request, params, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(ProductUpdateSchema))
    const { id, images } = form.data

    if (!form.valid) return fail(400, { form })

    try {
      await updateProduct(supabase, form.data)
      await updateProductImages(supabase, id, images)

      return { form }
    } catch (err) {
      if (isAppError(err)) {
        err.errorHandler()
      }
      return setError(form, '상품 수정 중 오류가 발생했습니다.')
    }
  },
}

const updateProduct = async (supabase: SupabaseClient, formData: ProductUpdateInput) => {
  const { id, storeId, categoryId, name, description, price, unit, quantityPerUnit, images, active } = formData

  const { error: updateError } = await supabase
    .from('products')
    .update({
      category_id: categoryId,
      name,
      description,
      price,
      unit,
      quantity_per_unit: quantityPerUnit,
      active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) throw updateError
}

const updateProductImages = async (supabase: SupabaseClient, productId: string, images: ImageInput[]) => {
  const { error: deleteError } = await supabase.from('product_images').delete().eq('product_id', productId)

  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('product_images').insert(
    images
      .filter((image) => image.use)
      .map((image, index) => ({
        product_id: productId,
        url: image.url,
        path: image.path,
        representative: image.representative,
        sort_order: index,
      }))
  )

  if (insertError) throw insertError
}
