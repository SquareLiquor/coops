import { signupApprovalRequestDataConverter } from '$lib/converters'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { data, error } = await locals.supabase
    .from('signup_approval_requests')
    .select(
      `
    *,
    applicant:applicant_id (*),
    approver:approver_id (*),
    store:store_id (*)
  `
    )
    .not('store_id', 'is', null)

  if (error) return { requests: [] }

  const { convertAll } = signupApprovalRequestDataConverter()

  console.log(data)
  return { requests: convertAll(data) }
}
