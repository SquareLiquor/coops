export const ssr = false

import { toStoreEntities } from '$lib/converters/store.converter'
import { getStore, setStore } from '$lib/stores'
import type { SupabaseClient } from '@supabase/supabase-js'
import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

/**
 * 메인 페이지 접근 시 상점 Store가 있는 지 체크, 없다면 페이지에서 선택
 */
export const load: PageLoad = async ({ url, parent }) => {
  const { supabase } = await parent()

  await setStoreIfExist(url, supabase)
  if (checkStoreExist()) {
    throw redirect(302, '/coops')
  }

  const { data } = await supabase.from('stores').select('*').neq('type', 'hq')
  return { stores: toStoreEntities(data) }
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
