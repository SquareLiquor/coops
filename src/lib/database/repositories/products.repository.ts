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

const productSelectQuery = `
  *,
  category:category_id(*),
  images:product_images(id, url, path, representative, sort_order)
`

export const getProducts = async (filter: ProductsFilterInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { storeId, categoryId, productName, status, dateFrom, dateTo } = filter

  const query = supabase
    .from('products')
    .select(productSelectQuery)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (categoryId) query.eq('category_id', categoryId)
  if (productName) query.ilike('name', `%${productName}%`)
  if (status) query.eq('status', status)
  if (dateFrom) query.gte('created_at', dateFrom)
  if (dateTo) query.lte('created_at', dateTo)

  const { data } = await query

  return { products: toProductEntities(data) }
}

export const getProductById = async (productId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('products')
    .select(productSelectQuery)
    .eq('id', productId)
    .eq('active', true)
    .maybeSingle()

  if (error) throw error

  return { product: toProductEntity(data) }
}

export const createProduct = async (formData: ProductCreateInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { storeId, categoryId, name, description, price, initialStock, unit, quantityPerUnit } = formData

  const { data, error } = await supabase
    .from('products')
    .insert({
      store_id: storeId,
      category_id: categoryId,
      name,
      description,
      price,
      initial_stock: initialStock,
      unit,
      quantity_per_unit: quantityPerUnit,
      active: true,
    })
    .select('*')
    .maybeSingle()

  if (error) throw error

  return { order: data }
}

export const updateProduct = async (formData: ProductUpdateInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { id, storeId, categoryId, name, description, price, unit, quantityPerUnit, images, active } = formData

  const { error: updateError } = await supabase
    .from('products')
    .update({
      category_id: categoryId,
      name,
      description,
      price,
      unit,
      quantity_per_unit: quantityPerUnit,
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
