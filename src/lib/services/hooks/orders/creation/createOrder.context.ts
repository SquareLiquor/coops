import type { OrderCreateInput } from '$lib/schemas'

export interface CreateOrderHookContext {
  order?: OrderCreateInput
  orderId?: string
}
