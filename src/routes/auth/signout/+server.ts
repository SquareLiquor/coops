import { clearAuth, clearStore } from '$lib/stores/index.js'
import { redirect } from '@sveltejs/kit'

export const POST = async ({ url, cookies, locals: { supabase } }) => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error.message)
    return new Response(JSON.stringify({ error: '로그아웃 중 오류가 발생하였습니다.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  clearAuth()
  clearStore()

  const redirectTo = url.searchParams.get('redirectTo') || '/'
  throw redirect(303, redirectTo)
}
