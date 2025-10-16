import { createHook } from '$lib/hooks/hooksManager'
import type { SignupContext } from '$lib/types'
import { createProfileHook } from './createProfileHook'
import { updateAppMetadataHook } from './updateAppMetadataHook'
import { validateSignupHook } from './validateSignupHook'

export const signupHook = createHook<SignupContext>()

// Add before sign up hooks
signupHook.before(validateSignupHook)

// Add after sign up hooks
signupHook.after(updateAppMetadataHook)
signupHook.after(createProfileHook)
