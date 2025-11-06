import type { Actions, PageServerLoad } from './$types'

const coopsSelectQuery = `
  *,
  product:product_id(*, images:product_images(*)),
  category:category_id(*)
`

export const load: PageServerLoad = async ({ parent, locals: { supabase } }) => {
  return { coopsSelectQuery }
}

export const actions: Actions = {
  default: async ({ locals, params }) => {},
}
