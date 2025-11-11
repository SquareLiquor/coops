import { createHook } from '$lib/hooks/hooksManager'
import type { CreateOrderHookContext } from '$lib/types'
import { createOrderItemsHook } from './createOrderItemsHook'
import { deleteOrderHook } from './deleteOrderHook'

export const createOrderHook = createHook<CreateOrderHookContext>()

createOrderHook.cleanup(deleteOrderHook)
createOrderHook.after(createOrderItemsHook)
