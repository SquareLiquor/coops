import { SignUpError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createServerClient } from '$lib/supabase'
import type { SignupContext } from '$lib/types'

/**
 * 사용자 메타데이터 업데이트 (권한 부여)
 */
const updateAppMetadata = async ({ formData, createdUser }: SignupContext) => {
  const { storeId } = formData
  const supabase = createServerClient()

  if (!createdUser || !createdUser.id) {
    throw new SignUpError('Created user is missing or invalid', {
      status: 400,
      code: 'missing_user_error',
      details: { error: 'createdUser is required for role assignment' },
    })
  }

  const { id: userId } = createdUser

  const { error } = await supabase.functions.invoke('grant_user_role', {
    method: 'POST',
    body: {
      user_id: userId,
      user_type: storeId ? 'admin' : 'consumer',
    },
  })

  if (error) {
    console.log('grant error', error)
    throw new SignUpError('Grant Role Error', {
      status: 400,
      code: 'grant_role_error',
      details: { error: '' },
    })
  }
}

export const updateAppMetadataHook: HookContext<SignupContext> = {
  hook: updateAppMetadata,
}
