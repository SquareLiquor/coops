import { SignUpError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createServerClient } from '$lib/supabase'
import type { SignupContext } from '$lib/types'

/**
 * 사용자 프로필 생성
 */
const createProfile = async ({ formData, createdUser }: SignupContext) => {
  const { name, phone1, phone2, phone3, storeId } = formData
  const supabase = createServerClient()

  if (!createdUser?.id) {
    throw new SignUpError('Created user is missing', {
      status: 400,
      code: 'missing_user_error',
      details: { error: 'createdUser is required for profile creation' },
    })
  }

  const profileData = {
    id: createdUser.id,
    name,
    phone: `${phone1}-${phone2}-${phone3}`,
    store_id: storeId || null,
    created_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('profiles').insert(profileData)

  if (error) {
    console.log('profile creation error', error)
    throw new SignUpError('Profile Creation Error', {
      status: 400,
      code: 'profile_creation_error',
      details: { error: error.message },
    })
  }
}

/**
 * 프로필 생성 롤백
 */
const rollbackProfile = async ({ createdUser }: SignupContext) => {
  if (!createdUser?.id) return

  const supabase = createServerClient()

  console.log('Rolling back profile creation for user:', createdUser.id)
  await supabase.from('profiles').delete().eq('id', createdUser.id)
}

export const createProfileHook: HookContext<SignupContext> = {
  hook: createProfile,
  cleanup: rollbackProfile,
}
