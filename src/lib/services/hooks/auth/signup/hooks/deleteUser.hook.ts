import { supabaseAdmin } from '$lib/database/clients/admin'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import type { SignupHookContext } from '../signup.context'

const deleteUser = async ({ userId }: SignupHookContext) => {
  if (userId) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  }
}

export const deleteUserHook: HookContext<SignupHookContext> = {
  cleanup: deleteUser,
}
