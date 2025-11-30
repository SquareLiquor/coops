import { getHQStore } from '$lib/database/repositories/stores.repository'
import { getStoreMemberByUserId } from '$lib/services/stores.service'
import type { LayoutServerLoad } from './$types'

const storeSelectQuery = `
  *,
  store:store_id(*),
  profile:user_id(*)
`

export const load: LayoutServerLoad = async ({ locals: { user } }) => {
  const { storeMember } = await getStoreMemberByUserId(user?.id)
  const { store: hqStore } = await getHQStore()

  return {
    store: storeMember?.store,
    hqStore: hqStore,
  }
}
