import { createServerClient } from '$lib/database'
import { SignUpError } from '$lib/errors'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import type { SignupHookContext } from '../signup.context'

// const supabase = createBrowserClient()

const requestSignupApproval = async ({ signupData, userId }: SignupHookContext) => {
  const supabase = createServerClient()
  const { storeId } = signupData

  const payload = {
    applicant_id: userId,
    store_id: storeId,
    status: storeId ? 'pending' : 'approved',
    requested_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from('signup_approval_requests').insert(payload)

  if (error) {
    throw new SignUpError('Request signup approval hook Error', {
      status: 400,
      code: 'request_signup_approval_hook_error',
      details: { error: error.message },
    })
  }
}

export const requestApprovalHook: HookContext<SignupHookContext> = {
  hook: requestSignupApproval,
}
