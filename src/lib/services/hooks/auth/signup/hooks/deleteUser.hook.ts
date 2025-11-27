import { deleteUser as deleteUserService } from '$lib/services/auth.service'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import type { SignupHookContext } from '../signup.context'

const deleteUser = async ({ userId }: SignupHookContext) => {
  if (!userId) return

  await deleteUserService(userId)
}

export const deleteUserHook: HookContext<SignupHookContext> = {
  cleanup: deleteUser,
}
