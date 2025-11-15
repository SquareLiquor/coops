import { OrderStatus } from '$lib/types'
import type { PageServerLoad } from './$types'

const ordersSelectQuery = `
  *,
  store:store_id(*),
  items:order_items(*, coop:coop_id(*, images:coop_images(*)))
`

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const statuses = Object.values(OrderStatus)

  return { ordersSelectQuery, statuses }
}
