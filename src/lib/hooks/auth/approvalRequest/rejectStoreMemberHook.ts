import { ApprovalError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createServerClient } from '$lib/supabase'
import type { ApproveRequestHookContext } from '$lib/types'

const deleteStoreMember = async ({ storeId, userId }: ApproveRequestHookContext) => {
  const supabase = createServerClient()

  if (!userId || !storeId) {
    throw new ApprovalError('', { code: 'MISSING_PARAMETERS', details: { storeId, userId } })
  }

  const { data } = await supabase
    .from('store_members')
    .select('*')
    .eq('store_id', storeId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!data) {
    return
  }

  if (userId && storeId) {
    const { error } = await supabase.from('store_members').delete().eq('store_id', storeId).eq('user_id', userId)

    if (error) {
      throw new ApprovalError('', { code: 'STORE_MEMBER_DELETION_FAILED', details: { error: error.message } })
    }
  }
}

export const deleteStoreMemberHook: HookContext<ApproveRequestHookContext> = {
  hook: deleteStoreMember,
}
