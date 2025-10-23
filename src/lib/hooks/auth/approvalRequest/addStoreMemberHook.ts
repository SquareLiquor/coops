import { ApprovalError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createServerClient } from '$lib/supabase'
import type { ApproveRequestHookContext } from '$lib/types'

const addStoreMember = async ({ storeId, userId }: ApproveRequestHookContext) => {
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

  if (data) {
    throw new ApprovalError('', { code: 'USER_ALREADY_MEMBER', details: { storeId, userId } })
  }

  const { error } = await supabase.from('store_members').insert({
    store_id: storeId,
    user_id: userId,
  })

  if (error) {
    throw new ApprovalError('', { code: 'STORE_MEMBER_CREATION_FAILED', details: { error: error.message } })
  }
}

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

export const addStoreMemberHook: HookContext<ApproveRequestHookContext> = {
  hook: addStoreMember,
  cleanup: deleteStoreMember,
}
