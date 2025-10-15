import { redirect } from '@sveltejs/kit'

export const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code') as string
  const next = url.searchParams.get('next') ?? '/'

  if (!code) redirect(303, '/')

  const {
    data: { user },
    error,
  } = await supabase.auth.exchangeCodeForSession(code)

  if (error) redirect(303, '/')
  if (!user) redirect(303, '/')

  const { app_metadata } = user
  const { approve_status, user_type } = app_metadata || {}

  if (!approve_status) {
    const { data: grantData, error: grantError } = await supabase.functions.invoke('grant_user_role', {
      method: 'POST',
      body: {
        user_id: user.id,
        user_type: 'consumer', // TO-DO: consumer / admin
      },
    })

    if (grantError) {
      console.error('역할 부여 실패:', grantError)
      redirect(303, '/')
    }
  }
  redirect(303, `/${next.slice(1)}`)
}
