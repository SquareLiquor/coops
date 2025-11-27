import { createUserProfile } from '$lib/services/auth.service'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import type { SignupHookContext } from '../signup.context'

const createProfile = async ({ signupData, userId }: SignupHookContext) => {
  if (!userId) return

  const { name, email, phone1, phone2, phone3 } = signupData
  if (!name || !email) return

  await createUserProfile(userId, { name, email, phone1, phone2, phone3 })
}

export const createProfileHook: HookContext<SignupHookContext> = {
  hook: createProfile,
}
