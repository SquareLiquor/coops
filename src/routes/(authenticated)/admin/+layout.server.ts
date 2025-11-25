import { toStoreEntity } from '$lib/converters/store.converter'
import { getHQStore, getStoreMemberByUserId } from '$lib/database/repositories/stores.repository'
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
    store: toStoreEntity(storeMember.store),
    hqStore: toStoreEntity(hqStore),
  }
}
