import { getStoreMemberByUserId } from '$lib/services/stores.service'
import type { LayoutServerLoad } from './$types'

const storeSelectQuery = `
  *,
  store:store_id(*),
  profile:user_id(*)
`

export const load: LayoutServerLoad = async ({ locals: { supabase, user } }) => {
  const { storeMember } = await getStoreMemberByUserId(user?.id)

  return {
    store: storeMember?.store,
  }
}
