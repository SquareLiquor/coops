import { coopDataConverter } from '$lib/converters/coopsConverter'
import { isBrowser } from '@supabase/ssr'
import { createBrowserClient } from '../clients/browser'
import { createServerClient } from '../clients/server'

const { convert } = coopDataConverter()

const coopSelectQuery = `
  *,
  store:store_id(*),
  images:coop_images(*),
  product:product_id(*),
  category:category_id(*)
`

export const getCoopById = async (coopId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('coops').select(coopSelectQuery).eq('id', coopId).maybeSingle()

  if (error) {
    console.error('공동구매 조회 오류:', error)
    return { coop: null }
  }

  return { coop: data ? convert(data) : null }
}
