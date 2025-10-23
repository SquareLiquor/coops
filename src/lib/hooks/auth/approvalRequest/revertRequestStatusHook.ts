import type { HookContext } from '$lib/hooks/hooksManager'
import type { ApproveRequestHookContext } from '$lib/types'

// TODO: 기능 구현
const revertRequestStatus = async ({ storeId, userId, originStatus }: ApproveRequestHookContext) => {
  // const supabase = createServerClient()
  // if (!userId || !storeId || !originStatus) {
  //   throw new ApprovalError('', { code: 'MISSING_PARAMETERS', details: { storeId, userId, originStatus } })
  // }
  // const { data, error } = await supabase
  //     .from('signup_approval_requests')
  //     .update({
  //       status: originStatus,
  //       approver_id: null,
  //       reason: '',
  //       cancelled_at: n,
  //     })
  //     .eq('id', id)
  //     .select(requestSelectQuery)
  //     .maybeSingle()
  // if (!data) {
  //   return
  // }
  // if (userId && storeId) {
  //   const { error } = await supabase.from('store_members').delete().eq('store_id', storeId).eq('user_id', userId)
  //   if (error) {
  //     throw new ApprovalError('', { code: 'STORE_MEMBER_DELETION_FAILED', details: { error: error.message } })
  //   }
  // }
}

export const revertRequestStatusHook: HookContext<ApproveRequestHookContext> = {
  cleanup: revertRequestStatus,
}
