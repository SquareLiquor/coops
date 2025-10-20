import { SignUpError } from '$lib/errors/index.js'
import { signupHook } from '$lib/hooks/index.js'
import type { ProfileData, SignupFormData } from '$lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'
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

  const status = await getApprovalStatus(supabase, user.id)

  const { user_metadata } = user
  const { email, storeId, name } = user_metadata

  const signupData: SignupFormData = { email, name, storeId }
  const userId = user.id

  try {
    // 회원 가입 처리 시에만 hook 실행
    if (!status) {
      await signupHook.runAfter({ supabase, signupData, userId })
    }
  } catch (error) {
    console.error('Error during signup hook after:', error)
    if (error instanceof SignUpError) {
      error.errorHandler()
    }
    await signupHook.runCleanup({ supabase, signupData, userId })
    throw redirect(303, '/auth')
  }
  // 성공 시 리디렉션은 try/catch 밖에서 처리
  throw redirect(303, `/${next.slice(1)}`)
}

// signup_approval_requests 테이블에서 승인 상태 조회 함수
const getApprovalStatus = async (supabase: SupabaseClient, userId: string): Promise<ProfileData | null> => {
  const { data } = await supabase
    .from('signup_approval_requests')
    .select('id, email, role, status')
    .eq('applicant_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data
}
