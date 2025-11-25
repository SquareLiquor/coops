import { createHook } from '$lib/services/hooks/hooksManager'
import type { ApproveRequestHookContext } from './approvalRequest.context'
import { addStoreMemberHook } from './hooks/addStoreMember.hook'
import { deleteStoreMemberHook } from './hooks/rejectStoreMember.hook'
import { revertRequestStatusHook } from './hooks/revertRequestStatus.hook'

export const approveRequestHook = createHook<ApproveRequestHookContext>()
approveRequestHook.cleanup(revertRequestStatusHook)
approveRequestHook.after(addStoreMemberHook)

export const rejectRequestHook = createHook<ApproveRequestHookContext>()
rejectRequestHook.cleanup(revertRequestStatusHook)
rejectRequestHook.after(deleteStoreMemberHook)
