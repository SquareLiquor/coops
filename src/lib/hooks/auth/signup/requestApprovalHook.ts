import { SignUpError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createServerClient } from '$lib/supabase'
import type { SignupHookContext } from '$lib/types'

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
    console.log('Error inserting signup approval request:', error)
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
