import { isAppError } from '$lib/errors'
import { createOrderHook } from '$lib/hooks/orders'
import { OrderSchema } from '$lib/schemas'
import { createOrder } from '$lib/supabase'
import { fail } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

const coopsSelectQuery = `
  *,
  store:store_id(*),
  images:coop_images(*),
  product:product_id(*),
  category:category_id(*)
`

export const load: PageServerLoad = async () => {
  const form = await superValidate(valibot(OrderSchema), { errors: false })

  return { form, coopsSelectQuery }
}

export const actions: Actions = {
  createOrder: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(OrderSchema))

    if (!form.valid) return fail(400, { form })

    try {
      const { data } = await createOrder(form.data)
      createOrderHook.runAfter({ order: form.data, orderId: data.id })

      return { form }
    } catch (error) {
      if (isAppError(error)) error.errorHandler()

      await createOrderHook.runCleanup({})
      return setError(form, '주문 생성 중 오류가 발생했습니다.')
    }
  },
}
