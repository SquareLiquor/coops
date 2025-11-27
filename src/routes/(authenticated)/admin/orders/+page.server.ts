import { toOrderEntities } from '$lib/converters/order.converter'
import {
  cancelOrderItem,
  checkOrderItemCancelable,
  checkOrderItemConfirmable,
  checkOrderItemRestorable,
  confirmOrderItem,
  getCategories,
  restoreOrderItem,
} from '$lib/database'
import { getInitialOrdersFilterValues as getInitialFilter, OrdersFilterSchema, OrderUpdateSchema } from '$lib/schemas'
import {
  cancelOrder,
  checkCancelable,
  checkConfirmable,
  checkRestorable,
  confirmOrder,
  getOrders,
  restoreOrder,
} from '$lib/services/orders.service'
import { OrderStatus } from '$lib/types'
import { message, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

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
  fetch: async ({ request }) => {
    const form = await superValidate(request, valibot(OrdersFilterSchema))
    if (!form.valid) return { form }

    try {
      const { orders, pagination } = await getOrders(form.data)

      return { form, orders: toOrderEntities(orders), pagination }
    } catch (error) {
      return { form }
    }
  },
  confirm: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderId } = form.data

    if (!form.valid) return { form }

    try {
      const confirmable = await checkConfirmable(orderId)
      if (!confirmable) return message(form, '주문 완료 처리가 불가능한 상태입니다.', { status: 409 })

      await confirmOrder(orderId)
      return message(form, '주문이 완료되었습니다.')
    } catch (error) {
      return message(form, '주문 완료 처리 중 오류가 발생했습니다.', { status: 400 })
    }
  },
  cancel: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderId } = form.data

    if (!form.valid) return { form }

    try {
      const cancelable = await checkCancelable(orderId)
      if (!cancelable) {
        return message(form, '주문 취소가 불가능한 상태입니다.', { status: 409 })
      }

      await cancelOrder(orderId)

      return message(form, '주문 취소가 완료되었습니다.')
    } catch (error) {
      return message(form, '주문 취소 처리 중 오류가 발생했습니다.', { status: 400 })
    }
  },
  restore: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderId } = form.data

    if (!form.valid) return { form }

    try {
      const confirmable = await checkRestorable(orderId)
      if (!confirmable) return message(form, '주문 복원 처리가 불가능한 상태입니다.', { status: 409 })

      await restoreOrder(orderId)
      return message(form, '주문 복구 처리되었습니다.')
    } catch (error) {
      return message(form, '주문 복구 처리 중 오류가 발생했습니다.', { status: 400 })
    }
  },

  confirmItem: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderItemId } = form.data

    if (!form.valid) return { form }

    try {
      const confirmable = await checkOrderItemConfirmable(orderItemId)
      if (!confirmable) return message(form, '해당 상품은 완료 처리할 수 없습니다.', { status: 409 })

      await confirmOrderItem(orderItemId)
      return message(form, '상품이 완료 처리되었습니다.')
    } catch (error) {
      return message(form, '상품 완료 처리 중 오류가 발생했습니다.', { status: 400 })
    }
  },
  cancelItem: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderItemId } = form.data

    if (!form.valid) return { form }

    try {
      const cancelable = await checkOrderItemCancelable(orderItemId)
      if (!cancelable) return message(form, '해당 상품은 취소할 수 없습니다.', { status: 409 })

      await cancelOrderItem(orderItemId)
      return message(form, '상품이 취소 처리되었습니다.')
    } catch (error) {
      return message(form, '상품 취소 처리 중 오류가 발생했습니다.', { status: 400 })
    }
  },
  restoreItem: async ({ request }) => {
    const form = await superValidate(request, valibot(OrderUpdateSchema))
    const { orderItemId } = form.data

    if (!form.valid) return { form }

    try {
      const restorable = await checkOrderItemRestorable(orderItemId)
      if (!restorable) return message(form, '해당 상품은 복원할 수 없습니다.', { status: 409 })

      await restoreOrderItem(orderItemId)
      return message(form, '상품이 복구 처리되었습니다.')
    } catch (error) {
      return message(form, '상품 복구 처리 중 오류가 발생했습니다.', { status: 400 })
    }
  },
}
