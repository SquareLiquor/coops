import { createHook } from '$lib/hooks/hooksManager'
import type { SignupHookContext } from '$lib/types'
import { createProfileHook } from './createProfileHook'
import { deleteUserHook } from './deleteUserHook'
import { requestSignupApprovalHook } from './requestSignupApprovalHook'
import { updateAppMetadataHook } from './updateAppMetadataHook'
import { validateSignupHook } from './validateSignupHook'

export const signupHook = createHook<SignupHookContext>()

// add cleanup
signupHook.cleanup(deleteUserHook)

// Add before sign up hooks & cleanup
signupHook.before(validateSignupHook)

// Add after sign up hooks & cleanup
signupHook.after(updateAppMetadataHook)
signupHook.after(requestSignupApprovalHook)
signupHook.after(createProfileHook)
