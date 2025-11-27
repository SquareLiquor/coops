import { toProductEntities, toProductEntity } from '$lib/converters/product.converter'
import {
  type ImageInput,
  type ProductCreateInput,
  type ProductsFilterInput,
  type ProductUpdateInput,
} from '$lib/schemas'
import { isBrowser } from '@supabase/ssr'
import { createBrowserClient } from '../clients/browser'
import { createServerClient } from '../clients/server'
import { paginate } from '../utils/pagination.util'

const productSelectQuery = `
  *,
  category:category_id(*),
  images:product_images(id, url, path, representative, sort_order)
`

export const getProducts = async (filter: ProductsFilterInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { storeId, categoryId, productName, status, dateFrom, dateTo, page, pageSize } = filter

  let query = supabase.from('products').select(productSelectQuery, { count: 'exact' }).eq('store_id', storeId)

  if (categoryId) query = query.eq('category_id', categoryId)
  if (productName) query = query.ilike('name', `%${productName}%`)
  if (status) query = query.eq('status', status)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)

  const result = await paginate(query.order('created_at', { ascending: false }), { page, pageSize }).execute()

  return {
    products: toProductEntities(result.data),
    pagination: result.pagination,
  }
}

export const getProductById = async (productId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('products').select(productSelectQuery).eq('id', productId).maybeSingle()

  if (error) throw error

  return { product: toProductEntity(data) }
}

export const createProduct = async (formData: ProductCreateInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const {
    storeId,
    categoryId,
    name,
    description,
    price,
    initialStock,
    capacity,
    sellUnit,
    purchaseUnit,
    purchaseQty,
    active,
  } = formData

  const { data, error } = await supabase
    .from('products')
    .insert({
      store_id: storeId,
      category_id: categoryId,
      name,
      description,
      price,
      initial_stock: initialStock,
      capacity_text: capacity,
      sell_unit_text: sellUnit,
      purchase_unit: purchaseUnit,
      purchase_qty: purchaseQty,
      active,
    })
    .select('*')
    .maybeSingle()

  if (error) throw error

  return { order: data }
}

export const updateProduct = async (formData: ProductUpdateInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { id, storeId, categoryId, name, description, price, capacity, sellUnit, purchaseUnit, purchaseQty, active } =
    formData

  const { error: updateError } = await supabase
    .from('products')
    .update({
      category_id: categoryId,
      name,
      description,
      price,
      capacity_text: capacity,
      sell_unit_text: sellUnit,
      purchase_unit: purchaseUnit,
      purchase_qty: purchaseQty,
      active,
    })
    .eq('id', id)

  if (updateError) throw updateError
}

export const updateProductImages = async (productId: string, images: ImageInput[]) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { error: deleteError } = await supabase.from('product_images').delete().eq('product_id', productId)

  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('product_images').insert(
    images
      .filter((image) => image.use)
      .map((image, index) => ({
        product_id: productId,
        url: image.url,
        path: image.path,
        representative: image.representative,
        sort_order: index,
      }))
  )

  if (insertError) throw insertError
}

export const insertProductImages = async (productId: string, images: ImageInput[]) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('product_images').insert(
    images.map((image, index) => ({
      product_id: productId,
      url: image.url,
      path: image.path,
      representative: image.representative,
      sort_order: index,
    }))
  )

  if (error) throw error

  return { data }
}

export const insertProduct = async (productData: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('products').insert([productData]).select().maybeSingle()

  if (error) throw error

  return { product: data }
}

export const deleteProduct = async (productId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { error } = await supabase.from('products').delete().eq('id', productId)

  if (error) throw error
}
