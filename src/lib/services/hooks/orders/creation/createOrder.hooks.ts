import { createHook } from '$lib/services/hooks/hooksManager'
import type { CreateOrderHookContext } from './createOrder.context'
import { deleteOrderHook } from './hooks/deleteOrder.hook'

export const createOrderHook = createHook<CreateOrderHookContext>()

createOrderHook.cleanup(deleteOrderHook)
