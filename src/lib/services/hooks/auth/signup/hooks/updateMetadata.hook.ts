import { updateUserMetadata } from '$lib/services/auth.service'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import type { SignupHookContext } from '../signup.context'

const updateAppMetadata = async ({ signupData, userId }: SignupHookContext) => {
  if (!userId) return

  const { storeType } = signupData

  await updateUserMetadata(userId, storeType)
}

export const updateAppMetadataHook: HookContext<SignupHookContext> = {
  hook: updateAppMetadata,
}
