import type { Actions, ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = async ({ locals: { supabase } }) => {}

export const actions: Actions = {
  fetch: async ({ request, locals: { supabase } }) => {},
  create: async ({ request, locals: { supabase } }) => {},
  update: async ({ request, locals: { supabase } }) => {},
  delete: async ({ request, locals: { supabase } }) => {},
}
