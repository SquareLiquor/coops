import { OrderStatus } from '$lib/types'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const statuses = Object.values(OrderStatus)

  return { statuses }
}
