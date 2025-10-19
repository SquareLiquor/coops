import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) return { profile: null }

  const { data: profile } = await locals.supabase.from('profiles').select('*').eq('id', locals.user.id).maybeSingle()

  return { profile }
}
