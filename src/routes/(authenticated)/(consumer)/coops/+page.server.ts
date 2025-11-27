import { isAppError } from '$lib/errors'
import { ConsumerCoopsFilterSchema as FilterSchema, OrderSchema } from '$lib/schemas'
import { getCoopsForUser } from '$lib/services/coops.service'
import { createOrderHook } from '$lib/services/hooks'
import { createOrder } from '$lib/services/orders.service'
import { fail } from '@sveltejs/kit'
import dayjs from 'dayjs'
import { message, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent()

  const form = await superValidate({ userId: user!.id }, valibot(OrderSchema), { errors: false })
  const filterForm = await superValidate({ dateAt: dayjs().format('YYYY-MM-DD') }, valibot(FilterSchema))

  return { form, filterForm }
}

export const actions: Actions = {
  /**
   * 공동구매 목록 조회
   */
  fetch: async ({ request }) => {
    const form = await superValidate(request, valibot(FilterSchema))
    if (!form.valid) return fail(400, { form })

    const { coops } = await getCoopsForUser(form.data)

    return { form, coops }
  },
  /**
   * 주문 생성
   */
  createOrder: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderSchema))
    if (!form.valid) return fail(400, { form })

    try {
      const { order } = await createOrder(form.data)
      createOrderHook.runAfter({ order: form.data, orderId: order?.id })

      return message(form, '주문이 성공적으로 생성되었습니다.')
    } catch (error) {
      if (isAppError(error)) error.errorHandler()

      await createOrderHook.runCleanup({})
      return message(form, '주문 생성 중 오류가 발생했습니다.', { status: 400 })
    }
  },
}
