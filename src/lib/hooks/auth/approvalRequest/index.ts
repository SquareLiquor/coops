import { createHook } from '$lib/hooks/hooksManager'
import type { ApproveRequestHookContext } from '$lib/types'
import { addStoreMemberHook } from './addStoreMemberHook'
import { deleteStoreMemberHook } from './rejectStoreMemberHook'
import { revertRequestStatusHook } from './revertRequestStatusHook'

export const approveRequestHook = createHook<ApproveRequestHookContext>()
approveRequestHook.cleanup(revertRequestStatusHook)
approveRequestHook.after(addStoreMemberHook)

export const rejectRequestHook = createHook<ApproveRequestHookContext>()
rejectRequestHook.cleanup(revertRequestStatusHook)
rejectRequestHook.after(deleteStoreMemberHook)
