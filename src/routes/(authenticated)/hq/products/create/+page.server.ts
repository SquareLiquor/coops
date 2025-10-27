import { ProductCreationSchema, type ProductCreationData } from '$lib/schemas/product/product'
import type { CategoryData } from '$lib/types'
import { fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from '../$types'

export const load: PageServerLoad = async ({ parent, locals: { supabase } }) => {
  const { store } = await parent()
  const initialProductData: ProductCreationData = {
    store_id: store?.id || '',
    category_id: '',
    name: '',
    description: '',
    price: 0,
    initial_stock: 0,
    images: [],
  }
  const form = await superValidate(initialProductData, valibot(ProductCreationSchema), { errors: false })

  const { data } = await supabase.from('categories').select('*').eq('store_id', store?.id).eq('active', true)

  return { form, categories: data as CategoryData[] }
}

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(ProductCreationSchema))
    const { store_id, category_id, name, description, price, initial_stock, images } = form.data

    console.log('form', form)
    if (!form.valid) {
      return fail(400, { form })
    }

    // TODO: create product hook
    // Step01: Hook Upload image

    // Step02: Insert Product
    const { data, error } = await supabase
      .from('products')
      .insert({
        store_id,
        category_id,
        name,
        description,
        price,
        initial_stock,
        active: true,
      })
      .select('*')
      .maybeSingle()

    console.log('insert product', { data, error })

    // Step03: Insert Product Images
    // const aa = await supabase.from('product_images').insert(
    //   images.map((image, index) => ({
    //     product_id: data.id,
    //     url: URL.createObjectURL(image.file), // uploaded url
    //     is_representative: image.is_representative,
    //     sort_order: index,
    //   }))
    // )
  },
}
