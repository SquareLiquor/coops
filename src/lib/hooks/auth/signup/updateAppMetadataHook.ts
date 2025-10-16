import { SignUpError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createServerClient } from '$lib/supabase'
import type { SignupHookContext } from '$lib/types'

/**
 * 사용자 메타데이터 업데이트 (권한 부여)
 *
 * TODO: Edge function에서 직접 업데이트로 변경, 이 부분 변경되면 Edge function 삭제
 */
const updateAppMetadata = async ({ formData, userId }: SignupHookContext) => {
  const { storeId } = formData
  const supabase = createServerClient()

  if (!userId) {
    throw new SignUpError('Created user is missing or invalid', {
      status: 400,
      code: 'missing_user_error',
      details: { error: 'createdUser is required for role assignment' },
    })
  }

  const { error } = await supabase.functions.invoke('grant_user_role', {
    method: 'POST',
    body: {
      user_id: userId,
      user_type: storeId ? 'admin' : 'consumer',
    },
  })

  if (error) {
    throw new SignUpError('Grant Role Error', {
      status: 400,
      code: 'grant_role_error',
    })
  }
}

export const updateAppMetadataHook: HookContext<SignupHookContext> = {
  hook: updateAppMetadata,
}
