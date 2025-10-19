import type { SignupFormData } from '$lib/types'

// form to context
export const signupFormConverter = (raw: Record<string, string | undefined>): SignupFormData => {
  const { email, name, phone1, phone2, phone3, password, confirmPassword, storeId } = raw

  return {
    email: email ?? '',
    name: name ?? '',
    phone1: phone1 ?? '',
    phone2: phone2 ?? '',
    phone3: phone3 ?? '',
    password: password ?? '',
    confirmPassword: confirmPassword ?? '',
    storeId: storeId ?? '',
  }
}

export const signinFormConverter = (raw: Record<string, string | undefined>) => {
  const { email, password } = raw

  return {
    email: email ?? '',
    password: password ?? '',
  }
}
