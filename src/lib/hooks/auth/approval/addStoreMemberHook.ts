import { SignUpError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createServerClient } from '$lib/supabase'
import type { SignupHookContext } from '$lib/types'

const addStoreMember = async ({ signupData, userId }: SignupHookContext) => {
  const supabase = createServerClient()
  const { storeId } = signupData

  if (userId && storeId) {
    const { error } = await supabase.from('store_members').insert({
      store_id: storeId,
      user_id: userId,
    })

    if (error) {
      console.log(error)
      throw new SignUpError('Store Member Registration Error', {
        status: 400,
        code: 'store_member_registration_error',
        details: { error: error.message },
      })
    }
  }
}

export const addStoreMemberHook: HookContext<SignupHookContext> = {
  hook: addStoreMember,
}
