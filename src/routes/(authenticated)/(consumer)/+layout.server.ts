import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ url, cookies, locals: { supabase } }) => {
  let storeId = url.searchParams.get('s') || cookies.get('store_id')
  if (!storeId) return {}

  const { data: store } = await supabase.from('stores').select('*').eq('id', storeId).maybeSingle()
  if (store) {
    cookies.set('store_id', storeId, { path: '/', httpOnly: true })
    return { store }
  }
}
