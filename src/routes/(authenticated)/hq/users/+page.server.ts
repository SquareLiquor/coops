import { signupApprovalRequestDataConverter } from '$lib/converters'
import { ApprovalStatus } from '$lib/types'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { data } = await locals.supabase
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

  const { convertAll } = signupApprovalRequestDataConverter()

  return {
    requests: data ? convertAll(data) : [],
    statusOptions: Object.values(ApprovalStatus),
  }
}
