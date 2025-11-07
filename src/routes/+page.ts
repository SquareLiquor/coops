export const ssr = false

import { storeDataConverter } from '$lib/converters'
import { getStore, setStore } from '$lib/stores'
import type { SupabaseClient } from '@supabase/supabase-js'
import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

const { convertAll } = storeDataConverter()

export const load: PageLoad = async ({ url, parent }) => {
  const { supabase } = await parent()

  await setStoreIfExist(url, supabase)
  if (checkStoreExist()) {
    throw redirect(302, '/coops')
  }

  const { data } = await supabase.from('stores').select('*').neq('type', 'hq')
  return { stores: convertAll(data || []) }
}

const setStoreIfExist = async (url: URL, supabase: SupabaseClient) => {
  const storeId = url.searchParams.get('s')

  if (storeId) {
    const { data } = await supabase.from('stores').select('*').eq('id', storeId).maybeSingle()
    !!data && setStore(data)
  }
}

const checkStoreExist = () => {
  return !!getStore()
}
