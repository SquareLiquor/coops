import { coopDataConverter } from '$lib/converters'
import { isAppError } from '$lib/errors'
import type { ImageInput } from '$lib/schemas'
import { coopDataToUpdateInput, CoopUpdateSchema, type CoopUpdateInput } from '$lib/schemas'
import { getCategories, getCoopById } from '$lib/supabase'
import { SalesStatus, UnitType } from '$lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { error, fail } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

const { convert } = coopDataConverter()

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
    coop: convert(coop),
    form,
    categories,
    unitTypes,
    salesStatuses,
  }
}

export const actions: Actions = {
  // 공동구매 수정
  update: async ({ request, params, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(CoopUpdateSchema))
    const { id, images } = form.data

    if (!form.valid) return fail(400, { form })

    try {
      await updateCoop(supabase, form.data)
      await updateProductImages(supabase, id, images)

      return { form }
    } catch (err) {
      if (isAppError(err)) {
        err.errorHandler()
      }
      return setError(form, '공동구매 수정 중 오류가 발생했습니다.')
    }
  },
}

const updateCoop = async (supabase: SupabaseClient, formData: CoopUpdateInput) => {
  const { id, storeId, categoryId, name, description, status, maxQuantity, salesPrice, salesDate } = formData

  const { error: updateError } = await supabase
    .from('coops')
    .update({
      category_id: categoryId,
      name,
      description,
      status,
      max_quantity: maxQuantity,
      sales_price: salesPrice,
      sales_date: salesDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) throw updateError

  return { success: true }
}

const updateProductImages = async (supabase: SupabaseClient, coopId: string, images: ImageInput[]) => {
  const { error: deleteError } = await supabase.from('coop_images').delete().eq('coop_id', coopId)

  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('coop_images').insert(
    images
      .filter((image) => image.use)
      .map((image, index) => ({
        coop_id: coopId,
        url: image.url,
        path: image.path,
        representative: image.representative,
        sort_order: index,
      }))
  )

  if (insertError) throw insertError
}
