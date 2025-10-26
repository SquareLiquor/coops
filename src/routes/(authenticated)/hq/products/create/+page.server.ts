import type { Actions, PageServerLoad } from '../$types'

export const load: PageServerLoad = async ({ locals }) => {
  return {}
}

export const actions: Actions = {
  default: async ({ request, locals }) => {},
}
