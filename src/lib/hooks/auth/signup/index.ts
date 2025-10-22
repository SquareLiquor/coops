import { createHook } from '$lib/hooks/hooksManager'
import type { SignupHookContext } from '$lib/types'
import { createProfileHook } from './createProfileHook'
import { deleteUserHook } from './deleteUserHook'
import { requestApprovalHook } from './requestApprovalHook'
import { updateAppMetadataHook } from './updateMetadataHook'

export const signupHook = createHook<SignupHookContext>()

// add cleanup
signupHook.cleanup(deleteUserHook)

// Add before sign up hooks & cleanup

// Add after sign up hooks & cleanup
signupHook.after(updateAppMetadataHook)
signupHook.after(createProfileHook)
signupHook.after(requestApprovalHook)
