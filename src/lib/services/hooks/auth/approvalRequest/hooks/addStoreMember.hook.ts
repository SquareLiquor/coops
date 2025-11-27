import type { HookContext } from '$lib/services/hooks/hooksManager'
import {
  addStoreMember as addStoreMemberService,
  deleteStoreMember as deleteStoreMemberService,
} from '$lib/services/stores.service'
import type { ApproveRequestHookContext } from '../approvalRequest.context'

const addStoreMember = async ({ storeId, userId }: ApproveRequestHookContext) => {
  if (!userId || !storeId) return

  // service layer에서 모든 비즈니스 로직 처리
  await addStoreMemberService(storeId, userId)
}

const deleteStoreMember = async ({ storeId, userId }: ApproveRequestHookContext) => {
  if (!userId || !storeId) return

  // service layer에서 모든 비즈니스 로직 처리
  await deleteStoreMemberService(storeId, userId)
}

export const addStoreMemberHook: HookContext<ApproveRequestHookContext> = {
  hook: addStoreMember,
  cleanup: deleteStoreMember,
}
