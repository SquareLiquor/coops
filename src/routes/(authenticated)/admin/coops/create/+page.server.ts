import { productDataConverter } from '$lib/converters/productConverter'
import { isAppError } from '$lib/errors'
import { createCoopHook } from '$lib/hooks/hooks/creation'
import { CoopCreateSchema, createInitialCoopValues, type CoopCreateInput } from '$lib/schemas'
import { getCategories } from '$lib/supabase'
import { SalesStatus, UnitType } from '$lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from '../$types'

const { convert } = productDataConverter()

export const load: PageServerLoad = async ({ parent }) => {
  const { store } = await parent()

  const initialCoopValues = createInitialCoopValues(store?.id)
  const form = await superValidate(initialCoopValues, valibot(CoopCreateSchema), { errors: false })

  const { categories } = await getCategories(store?.id)
  const unitTypes = [...Object.values(UnitType)]
  const salesStatuses = [...Object.values(SalesStatus)]

  return { form, categories, unitTypes, salesStatuses }
}

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(CoopCreateSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    try {
      const { shared } = await createCoopHook.runBefore({ coop: form.data, product: form.data.mappedProduct })

      const { data } = await createCoop(supabase, form.data, shared.get('productId'))

      return { form }
    } catch (error) {
      console.error(error)
      if (isAppError(error)) {
        error.errorHandler()
        await createCoopHook.runCleanup({})
      }
      return fail(500, { form, message: '상품 등록 중 오류가 발생했습니다.' })
    }
  },
}

const createCoop = async (supabase: SupabaseClient, formData: CoopCreateInput, productId: string) => {
  const { store_id, name, status, max_quantity, sales_price, sales_date, description } = formData

  const { data, error } = await supabase
    .from('coops')
    .insert({
      store_id,
      product_id: productId,
      status,
      max_quantity,
      sales_price,
      sales_date,
      name,
      description,
    })
    .select('*')
    .maybeSingle()

  if (error) throw error

  return { data }
}
