import type { HookContext } from '$lib/hooks/hooksManager'
import { supabaseAdmin } from '$lib/supabase/admin'
import type { SignupHookContext } from '$lib/types'

const deleteUser = async ({ userId }: SignupHookContext) => {
  if (userId) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  }
}

export const deleteUserHook: HookContext<SignupHookContext> = {
  cleanup: deleteUser,
}
