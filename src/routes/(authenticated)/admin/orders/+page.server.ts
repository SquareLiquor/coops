import { orderDataConverter } from '$lib/converters'
import { getInitialOrdersFilterValues as getInitialFilter, OrdersFilterSchema, OrderUpdateSchema } from '$lib/schemas'
import { cancelOrder, checkOrderItemCancelable, getCategories, getOrders } from '$lib/supabase'
import { OrderStatus } from '$lib/types'
import { message, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

const { convertAll } = orderDataConverter()

export const load: PageServerLoad = async ({ parent }) => {
  const { store } = await parent()

  const initialFilter = getInitialFilter(store!.id)
  const filterForm = await superValidate(initialFilter, valibot(OrdersFilterSchema))
  const form = await superValidate(valibot(OrderUpdateSchema), { errors: false })

  const { categories } = await getCategories(store!.id)

  const salesStatuses = [{ code: undefined, label: '전체' }, ...Object.values(OrderStatus)]

  return {
    form,
    filterForm,
    categories,
    salesStatuses,
  }
}

export const actions: Actions = {
  fetch: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(OrdersFilterSchema))
    if (!form.valid) return { form }

    try {
      const { orders } = await getOrders(form.data)

      return { form, orders: convertAll(orders) }
    } catch (error) {
      console.error('주문 조회 오류:', error)
      return { form }
    }
  },
  confirm: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderId } = form.data

    if (!form.valid) return { form }
  },
  cancel: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderId } = form.data

    if (!form.valid) return { form }

    try {
      const cancelable = await checkOrderItemCancelable(orderId)
      if (!cancelable) {
        return message(form, '주문 취소가 불가능한 상태입니다.', { status: 409 })
      }

      await cancelOrder(orderId)

      return message(form, '주문 취소가 완료되었습니다.')
    } catch (error) {
      return message(form, '주문 취소 중 오류가 발생했습니다.', { status: 400 })
    }
  },
  restore: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderId } = form.data

    if (!form.valid) return { form }
  },
  confirmOrderItem: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderItemId } = form.data

    if (!form.valid) return { form }
  },
  cancelOrderItem: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderItemId } = form.data

    if (!form.valid) return { form }
  },
  restoreOrderItem: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderItemId } = form.data

    if (!form.valid) return { form }
  },
}
