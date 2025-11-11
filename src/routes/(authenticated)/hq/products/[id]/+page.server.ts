import { isAppError } from '$lib/errors'
import { ProductUpdateSchema, type ProductUpdateInput } from '$lib/schemas'
import { getCategories, getProductById } from '$lib/supabase'
import { UnitType } from '$lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { error, fail, redirect } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const { product } = await getProductById(params.id)

  if (!product) {
    throw error(404, '상품을 찾을 수 없습니다.')
  }

  // 수정용 폼 데이터 준비
  const productFormData = {
    id: product.id,
    store_id: product.store_id,
    category_id: product.category_id,
    name: product.name,
    description: product.description,
    price: product.price,
    unit: product.unit,
    quantity_per_unit: product.quantity_per_unit,
    images: product.images || [],
    active: product.active ?? true,
  }

  const form = await superValidate(productFormData, valibot(ProductUpdateSchema), { errors: false })
  const { categories } = await getCategories(product.store_id)
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

    if (!form.valid) return fail(400, { form })

    try {
      await updateProduct(supabase, form.data)

      return { form }
    } catch (err) {
      if (isAppError(err)) {
        err.errorHandler()
      }
      return setError(form, '상품 수정 중 오류가 발생했습니다.')
    }
  },

  // 상품 삭제
  delete: async ({ params, locals: { supabase } }) => {
    try {
      await deleteProduct(supabase, params.id)

      throw redirect(302, '/hq/products')
    } catch (err) {
      if (isAppError(err)) {
        err.errorHandler()
      }
      throw error(500, '상품 삭제 중 오류가 발생했습니다.')
    }
  },
}

const updateProduct = async (supabase: SupabaseClient, formData: ProductUpdateInput) => {
  const { id, store_id, category_id, name, description, price, unit, quantity_per_unit, images, active } = formData

  const { error: updateError } = await supabase
    .from('products')
    .update({
      category_id,
      name,
      description,
      price,
      unit,
      quantity_per_unit,
      active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) throw updateError

  // 이미지 업데이트 로직이 필요하다면 여기에 추가
  // 기존 이미지 삭제 및 새 이미지 추가 로직
}

const deleteProduct = async (supabase: SupabaseClient, productId: string) => {
  // Soft delete - active를 false로 설정
  const { error: deleteError } = await supabase
    .from('products')
    .update({
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)

  if (deleteError) throw deleteError
}
