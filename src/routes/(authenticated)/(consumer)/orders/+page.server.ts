import { orderDataConverter } from '$lib/converters'
import { ConsumerOrdersFilterSchema as FilterSchema, OrderUpdateSchema } from '$lib/schemas'
import {
  cancelOrder,
  cancelOrderItem,
  checkCancelable,
  checkOrderItemCancelable,
  getOrdersByUserId,
} from '$lib/supabase'
import { OrderStatus } from '$lib/types'
import { fail } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

const { convertAll } = orderDataConverter()

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent()

  const form = await superValidate(valibot(OrderUpdateSchema), { errors: false })
  const filterForm = await superValidate({ userId: user.id }, valibot(FilterSchema))

  const statuses = Object.values(OrderStatus)

  return { form, filterForm, statuses }
}

export const actions: Actions = {
  /**
   * 주문 목록 조회
   */
  fetch: async ({ request }) => {
    const form = await superValidate(request, valibot(FilterSchema))
    if (!form.valid) return fail(400, { form })

    const { orders } = await getOrdersByUserId(form.data)

    return { form, orders: convertAll(orders) }
  },
  /**
   * 주문 취소
   */
  cancel: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderId } = form.data

    if (!form.valid) return fail(400, { form })

    try {
      const cancelable = await checkCancelable(orderId)
      if (!cancelable) {
        return message(form, '주문 취소가 불가능한 상태입니다.', { status: 409 })
      }

      await cancelOrder(orderId)

      return message(form, '주문 취소가 완료되었습니다.')
    } catch (error) {
      return message(form, '주문 취소 중 오류가 발생했습니다.', { status: 400 })
    }
  },
  /**
   * 주문 상품 개별 취소
   */
  cancelItem: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderItemId } = form.data

    if (!form.valid) return fail(400, { form })

    try {
      const cancelable = await checkOrderItemCancelable(orderItemId!)
      if (!cancelable) {
        return message(form, '취소가 불가능한 상태입니다.', { status: 409 })
      }

      await cancelOrderItem(orderItemId!)

      return message(form, '취소가 완료되었습니다.')
    } catch (error) {
      return message(form, '취소 중 오류가 발생했습니다.', { status: 400 })
    }
  },
}
