import { createHook } from '$lib/hooks/hooksManager'
import type { SignupHookContext } from '$lib/types'
import { createProfileHook } from './createProfileHook'
import { addStoreMemberHook } from './createStoreMemberHook'
import { deleteUserHook } from './deleteUserHook'
import { requestSignupApprovalHook } from './requestSignupApprovalHook'
import { updateAppMetadataHook } from './updateAppMetadataHook'

export const signupHook = createHook<SignupHookContext>()

// add cleanup
signupHook.cleanup(deleteUserHook)

// Add before sign up hooks & cleanup

// Add after sign up hooks & cleanup
signupHook.after(updateAppMetadataHook)
signupHook.after(createProfileHook)
signupHook.after(addStoreMemberHook)
signupHook.after(requestSignupApprovalHook)
