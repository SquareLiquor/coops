import type { HookContext } from '$lib/services/hooks/hooksManager'
import { createOrderItems as createOrderItemsService } from '$lib/services/orders.service'
import type { CreateOrderHookContext } from '../createOrder.context'

const createOrderItems = async ({ order, orderId }: CreateOrderHookContext, shared: any) => {
  if (!orderId) return

  shared.set('orderId', orderId)

  const { items = [] } = order || {}

  // service layer에서 모든 비즈니스 로직 처리
  await createOrderItemsService(orderId, items)
}

export const createOrderItemsHook: HookContext<CreateOrderHookContext> = {
  hook: createOrderItems,
}
