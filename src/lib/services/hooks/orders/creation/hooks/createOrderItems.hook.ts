import { createBrowserClient, createServerClient } from '$lib/database'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import { OrderStatus } from '$lib/types'
import { isBrowser } from '@supabase/ssr'
import type { CreateOrderHookContext } from '../createOrder.context'

const createOrderItems = async ({ order, orderId }: CreateOrderHookContext, shared: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  shared.set('orderId', orderId)

  const { items = [] } = order || {}

  const { data, error } = await supabase.from('order_items').insert(
    items.map((item) => ({
      order_id: orderId,
      coop_id: item.coopId,
      quantity: item.quantity,
      price: item.price,
      total_price: item.quantity * item.price,
      status: OrderStatus.CREATED.code,
    }))
  )

  if (error) throw new Error(`ORDER_ITEM_CREATION_FAILED: ${error.message}`)
}

export const createOrderItemsHook: HookContext<CreateOrderHookContext> = {
  hook: createOrderItems,
}
