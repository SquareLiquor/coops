import { createSignupApprovalRequest } from '$lib/services/auth.service'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import type { SignupHookContext } from '../signup.context'

const requestSignupApproval = async ({ signupData, userId }: SignupHookContext) => {
  if (!userId) return

  const { storeId } = signupData

  await createSignupApprovalRequest(userId, storeId)
}

export const requestApprovalHook: HookContext<SignupHookContext> = {
  hook: requestSignupApproval,
}
