import { productDataConverter } from '$lib/converters/productConverter'
import { createInitialProductValues, ProductCreationSchema, type ProductInput } from '$lib/schemas/product/product'
import { getCategories } from '$lib/supabase'
import { UnitType } from '$lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from '../$types'

const { convert } = productDataConverter()

export const load: PageServerLoad = async ({ parent }) => {
  const { store } = await parent()

  const initialProductValues = createInitialProductValues(store?.id)
  const form = await superValidate(initialProductValues, valibot(ProductCreationSchema), { errors: false })

  const { categories } = await getCategories(store?.id)
  const unitTypes = [...Object.values(UnitType)]

  return { form, categories, unitTypes }
}

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(ProductCreationSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    try {
      const { data } = await createProduct(supabase, form.data)
      // await createProductHook.runAfter()

      return { form, product: convert(data) }
    } catch (error) {
      console.error(error)
      return fail(500, { message: '상품 등록 중 오류가 발생했습니다.' })
    }
  },
}

const createProduct = async (supabase: SupabaseClient, formData: ProductInput) => {
  const { store_id, category_id, name, description, price, initial_stock, images } = formData

  const { data, error } = await supabase
    .from('products')
    .insert({
      store_id,
      category_id,
      name,
      description,
      price,
      initial_stock,
      active: true,
    })
    .select('*')
    .maybeSingle()

  console.log({ data, error })

  if (error) throw error

  return { data }
}
