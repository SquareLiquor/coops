import { SignUpError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import type { SignupContext } from '$lib/types'

/**
 * 회원가입 폼 데이터 검증
 */
const validate = async ({ formData }: SignupContext) => {
  const error: Record<string, string> = {}

  const { phone2, phone3, password, confirmPassword } = formData

  if (phone2 && phone2.length !== 4) {
    error.phone2 = '전화번호 두 번째 부분은 4자리여야 합니다.'
  }

  if (phone3 && phone3.length !== 4) {
    error.phone3 = '전화번호 세 번째 부분은 4자리여야 합니다.'
  }

  if (password !== confirmPassword) {
    error.confirmPassword = '비밀번호가 일치하지 않습니다.'
  }

  if (Object.keys(error).length > 0) {
    throw new SignUpError('Validation Error', {
      status: 400,
      code: 'validation_error',
      details: error,
    })
  }
}

export const validateSignupHook: HookContext<SignupContext> = {
  hook: validate,
}
