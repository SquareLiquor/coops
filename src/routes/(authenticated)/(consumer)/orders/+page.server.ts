import type { PageServerLoad } from './$types'

const ordersSelectQuery = `
  *,
  store:store_id(*),
  items:order_items(*, coop:coop_id(*, images:coop_images(*)))
`

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  // filter form, category
  // order status change form
  return { ordersSelectQuery }
}
