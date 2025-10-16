import { fail, redirect, type Actions } from '@sveltejs/kit'

export const actions: Actions = {
  signin_kakao: async ({ locals: { supabase }, url }) => {
    const { data: signinData, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${url.origin}/auth/callback?next=/`,
      },
    })

    if (error) {
      const errors: Record<string, string> = { general: '카카오 인증에 실패하였습니다.' }

      return fail(401, { errors })
    }

    throw redirect(303, signinData.url)
  },
}
