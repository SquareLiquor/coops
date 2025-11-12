import { productDataConverter } from '$lib/converters'
import { isAppError } from '$lib/errors'
import { createCoopHook } from '$lib/hooks'
import { CoopCreateSchema, getInitialCoopValues, type CoopCreateInput } from '$lib/schemas'
import { getCategories } from '$lib/supabase'
import { SalesStatus, UnitType } from '$lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fail, type Actions } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { PageServerLoad } from './$types'

const { convert } = productDataConverter()

export const load: PageServerLoad = async ({ parent }) => {
  const { store } = await parent()

  const initialCoopValues = getInitialCoopValues(store!.id)
  const form = await superValidate(initialCoopValues, valibot(CoopCreateSchema), { errors: false })

  const { categories } = await getCategories(store!.id)
  const unitTypes = [...Object.values(UnitType)]
  const salesStatuses = [...Object.values(SalesStatus)]

  return { form, categories, unitTypes, salesStatuses }
}

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(CoopCreateSchema))

    if (!form.valid) return fail(400, { form })

    try {
      const { shared } = await createCoopHook.runBefore({ coop: form.data })

      const { data } = await createCoop(supabase, form.data, shared.get('productId'))
      shared.set('coopId', data.id)

      await createCoopHook.runAfter({ images: form.data.images })

      return { form }
    } catch (error) {
      console.log('error', error)
      if (isAppError(error)) {
        error.errorHandler()
        await createCoopHook.runCleanup({})
      }
      return setError(form, '판매 상품 등록 중 오류가 발생했습니다.')
    }
  },
}

const createCoop = async (supabase: SupabaseClient, formData: CoopCreateInput, productId: string) => {
  const { storeId, name, categoryId, status, maxQuantity, salesPrice, salesDate, description } = formData

  const { data, error } = await supabase
    .from('coops')
    .insert({
      store_id: storeId,
      product_id: productId,
      category_id: categoryId,
      status,
      max_quantity: maxQuantity,
      sales_price: salesPrice,
      sales_date: salesDate,
      name,
      description,
    })
    .select('*')
    .maybeSingle()

  if (error) throw error

  return { data }
}
