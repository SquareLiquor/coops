import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { deleteOrderById } from '$lib/supabase'
import type { CreateOrderHookContext } from '$lib/types'

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
