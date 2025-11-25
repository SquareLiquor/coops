import { isBrowser } from '@supabase/ssr'
import { createBrowserClient, createServerClient } from '../clients'

const storeSelectQuery = `
  *,
  store:store_id(*),
  profile:user_id(*)
`

export const getStores = async () => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
}

export const getStoreById = async (id: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
}

export const getHQStore = async () => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('stores').select('*').eq('type', 'hq').maybeSingle()

  return { store: data }
}

export const getStoreMemberByUserId = async (userId: string | undefined) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('store_members')
    .select(storeSelectQuery)
    .eq('user_id', userId)
    .maybeSingle()

  return { storeMember: data }
}
