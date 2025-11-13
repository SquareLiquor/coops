import type { HookContext } from '$lib/hooks/hooksManager'
import { createBrowserClient, createServerClient } from '$lib/supabase'
import { OrderStatus, type CreateOrderHookContext } from '$lib/types'
import { isBrowser } from '@supabase/ssr'

const createOrderItems = async ({ order, orderId }: CreateOrderHookContext, shared: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  shared.set('orderId', orderId)

  const { items = [] } = order || {}

  const { data, error } = await supabase.from('order_items').insert(
    items.map((item) => ({
      order_id: orderId,
      coop_id: item.coop_id,
      quantity: item.quantity,
      price: item.price,
      total_price: item.quantity * item.price,
      status: OrderStatus.ORDERED.code,
    }))
  )

  if (error) throw new Error(`ORDER_ITEM_CREATION_FAILED: ${error.message}`)
}

export const createOrderItemsHook: HookContext<CreateOrderHookContext> = {
  hook: createOrderItems,
}
