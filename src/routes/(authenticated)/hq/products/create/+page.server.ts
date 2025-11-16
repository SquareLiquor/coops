import { productDataConverter } from '$lib/converters'
import { isAppError } from '$lib/errors'
import { createProductHook } from '$lib/hooks'
import { createInitialProductValues, ProductCreateSchema, type ProductCreateInput } from '$lib/schemas'
import { getCategories } from '$lib/supabase'
import { UnitType } from '$lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fail } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

const { convert } = productDataConverter()

export const load: PageServerLoad = async ({ parent }) => {
  const { store } = await parent()

  const initialProductValues = createInitialProductValues(store!.id)
  const form = await superValidate(initialProductValues, valibot(ProductCreateSchema), { errors: false })

  const { categories } = await getCategories(store!.id)
  const unitTypes = [...Object.values(UnitType)]

  return { form, categories, unitTypes }
}

export const actions: Actions = {
  create: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(ProductCreateSchema))

    if (!form.valid) return fail(400, { form })

    try {
      const { data } = await createProduct(supabase, form.data)
      await createProductHook.runAfter({ product: form.data, productId: data.id, images: form.data.images })

      return { form }
    } catch (error) {
      if (isAppError(error)) error.errorHandler()

      await createProductHook.runCleanup({})
      return setError(form, '상품 등록 중 오류가 발생했습니다.')
    }
  },
}

const createProduct = async (supabase: SupabaseClient, formData: ProductCreateInput) => {
  const { storeId, categoryId, name, description, price, initialStock, unit, quantityPerUnit } = formData

  const { data, error } = await supabase
    .from('products')
    .insert({
      store_id: storeId,
      category_id: categoryId,
      name,
      description,
      price,
      initial_stock: initialStock,
      unit,
      quantity_per_unit: quantityPerUnit,
      active: true,
    })
    .select('*')
    .maybeSingle()

  if (error) throw error

  return { data }
}
