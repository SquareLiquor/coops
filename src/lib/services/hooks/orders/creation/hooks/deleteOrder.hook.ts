import type { HookContext } from '$lib/services/hooks/hooksManager'
import { deleteOrder as deleteOrderService } from '$lib/services/orders.service'
import type { CreateOrderHookContext } from '../createOrder.context'

const deleteOrder = async (context: CreateOrderHookContext, shared: any) => {
  const orderId = shared.get('orderId')
  if (!orderId) return

  await deleteOrderService(orderId)
}

export const deleteOrderHook: HookContext<CreateOrderHookContext> = {
  cleanup: deleteOrder,
}
