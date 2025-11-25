import { createHook } from '$lib/services/hooks/hooksManager'
import { createProfileHook } from './hooks/createProfile.hook'
import { deleteUserHook } from './hooks/deleteUser.hook'
import { requestApprovalHook } from './hooks/requestApproval.hook'
import { updateAppMetadataHook } from './hooks/updateMetadata.hook'
import type { SignupHookContext } from './signup.context'

export const signupHook = createHook<SignupHookContext>()

// add cleanup
signupHook.cleanup(deleteUserHook)

// Add before sign up hooks & cleanup

// Add after sign up hooks & cleanup
signupHook.after(updateAppMetadataHook)
signupHook.after(createProfileHook)
signupHook.after(requestApprovalHook)
