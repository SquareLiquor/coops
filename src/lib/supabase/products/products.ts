import { productDataConverter } from '$lib/converters/productConverter'
import { isBrowser } from '@supabase/ssr'
import { createBrowserClient } from '../clients/browser'
import { createServerClient } from '../clients/server'

const { convert } = productDataConverter()

export const getProductById = async (productId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(id, name),
      images:product_images(id, url, path, representative, sort_order)
    `
    )
    .eq('id', productId)
    .eq('active', true)
    .maybeSingle()

  if (error) {
    console.error('상품 조회 오류:', error)
    return { product: null }
  }

  return { product: data ? convert(data) : null }
}

export const getProducts = async (
  storeId: string,
  options?: {
    category?: string
    search?: string
    limit?: number
    offset?: number
  }
) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  let query = supabase
    .from('products')
    .select(
      `
      *,
      category:categories(id, name),
      images:product_images(id, url, representative, sort_order)
    `
    )
    .eq('store_id', storeId)
    .eq('active', true)

  if (options?.category) {
    query = query.eq('category_id', options.category)
  }

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('상품 목록 조회 오류:', error)
    return { products: [] }
  }

  return { products: data?.map(convert) || [] }
}
