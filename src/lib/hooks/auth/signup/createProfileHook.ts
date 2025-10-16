import { SignUpError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import type { SignupHookContext } from '$lib/types'

/**
 * 사용자 프로필 생성
 */
const createProfile = async ({ formData, userId, supabase }: SignupHookContext) => {
  const { name, phone1, phone2, phone3 } = formData

  let payload: Record<string, any> = {
    id: userId,
    name,
  }

  // 전화번호가 모두 존재하고 숫자 형식일 때만 phone 추가
  if (/^[0-9]+$/.test(phone1) && /^[0-9]+$/.test(phone2) && /^[0-9]+$/.test(phone3)) {
    payload.phone = `${phone1}-${phone2}-${phone3}`
  }

  const { error } = await supabase.from('profiles').insert(payload)

  if (error) {
    throw new SignUpError('Profile Creation Error', {
      status: 400,
      code: 'profile_creation_error',
      details: { error: error.message },
    })
  }
}

export const createProfileHook: HookContext<SignupHookContext> = {
  hook: createProfile,
}
