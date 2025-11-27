import type { HookContext } from '$lib/services/hooks/hooksManager'
import { deleteStoreMember as deleteStoreMemberService } from '$lib/services/stores.service'
import type { ApproveRequestHookContext } from '../approvalRequest.context'

const deleteStoreMember = async ({ storeId, userId }: ApproveRequestHookContext) => {
  if (!userId || !storeId) return

  await deleteStoreMemberService(storeId, userId)
}

export const deleteStoreMemberHook: HookContext<ApproveRequestHookContext> = {
  hook: deleteStoreMember,
}
