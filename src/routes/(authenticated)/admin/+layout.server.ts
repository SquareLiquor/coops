import { toStoreEntity } from '$lib/converters/store.converter'
import type { LayoutServerLoad } from './$types'

const storeSelectQuery = `
  *,
  store:store_id(*),
  profile:user_id(*)
`

export const load: LayoutServerLoad = async ({ locals: { supabase, user } }) => {
  const { data } = await supabase.from('store_members').select(storeSelectQuery).eq('user_id', user?.id).maybeSingle()
  const { data: hqStore } = await supabase.from('stores').select('*').eq('type', 'hq').maybeSingle()

  return {
    store: toStoreEntity(data.store),
    hqStore: toStoreEntity(hqStore),
  }
}
