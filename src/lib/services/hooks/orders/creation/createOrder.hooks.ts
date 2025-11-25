import { createHook } from '$lib/services/hooks/hooksManager'
import type { CreateOrderHookContext } from './createOrder.context'
import { createOrderItemsHook } from './hooks/createOrderItems.hook'
import { deleteOrderHook } from './hooks/deleteOrder.hook'

export const createOrderHook = createHook<CreateOrderHookContext>()

createOrderHook.cleanup(deleteOrderHook)
createOrderHook.after(createOrderItemsHook)
