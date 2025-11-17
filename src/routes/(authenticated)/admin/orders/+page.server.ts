import { orderDataConverter } from '$lib/converters'
import { getInitialOrdersFilterValues as getInitialFilter, OrdersFilterSchema } from '$lib/schemas'
import { getCategories, getOrders } from '$lib/supabase'
import { OrderStatus } from '$lib/types'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

const { convertAll } = orderDataConverter()

export const load: PageServerLoad = async ({ parent }) => {
  const { store } = await parent()

  const initialFilter = getInitialFilter(store!.id)
  const filterForm = await superValidate(initialFilter, valibot(OrdersFilterSchema))

  const { categories } = await getCategories(store!.id)

  const salesStatuses = [{ code: undefined, label: '전체' }, ...Object.values(OrderStatus)]

  return {
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
}
