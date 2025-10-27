import { storeDataConverter } from '$lib/converters'
import type { LayoutServerLoad } from './$types'

const { convert } = storeDataConverter()

const storeSelectQuery = `
  *,
  store:store_id(*),
  profile:user_id(*)
`

export const load: LayoutServerLoad = async ({ locals: { supabase, user } }) => {
  const { data } = await supabase.from('store_members').select(storeSelectQuery).eq('user_id', user?.id).maybeSingle()

  const store = convert(data.store)

  return {
    store,
  }
}
