import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ url, cookies, locals: { supabase } }) => {
  let storeId = cookies.get('store_id')
  if (!storeId) return {}

  const { data: store } = await supabase.from('stores').select('*').eq('id', storeId).maybeSingle()
  if (store) return { store }
}
