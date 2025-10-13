import type { Actions } from '@sveltejs/kit'

export const actions: Actions = {
  signUp: async ({ request, locals: { supabase } }) => {},
  signIn: async ({ request, locals: { supabase } }) => {},
}
