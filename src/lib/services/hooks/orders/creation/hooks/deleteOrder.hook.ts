import { deleteOrderById } from '$lib/database'
import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import type { CreateOrderHookContext } from '../createOrder.context'

const deleteOrder = async (shared: any) => {
  const orderId = shared.get('orderId')
  try {
    await deleteOrderById(orderId)
  } catch (error) {
    throw new SupabaseError('ORDER_DELETION_FAILED')
  }
}

export const deleteOrderHook: HookContext<CreateOrderHookContext> = {
  cleanup: deleteOrder,
}
