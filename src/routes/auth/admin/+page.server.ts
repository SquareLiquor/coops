import { signinFormConverter, signupFormConverter } from '$lib/converters'
import { SignInError, SignUpError } from '$lib/errors'
import { signupHook } from '$lib/hooks/'
import type { SigninFormData, SignupFormData, StorePublic } from '$lib/types'
import { extractFormData } from '$lib/utils/form'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fail, redirect, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

const signupFields = ['email', 'name', 'phone1', 'phone2', 'phone3', 'password', 'confirmPassword', 'storeId']
const signinFields = ['email', 'password']

/**
 *
 * @param param0
 * @returns
 */
export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: stores, error } = await supabase
    .from('stores_public')
    .select('*')
    .order('type', { ascending: true }) // 'hq' 먼저
    .order('name', { ascending: true }) // 이름순 정렬

  if (error) {
    return {
      stores: [] as StorePublic[],
    }
  }

  return {
    stores: (stores || []) as StorePublic[],
  }
}

export const actions: Actions = {
  /**
   *
   * @param param0
   * @returns
   */
  signup: async ({ request, locals: { supabase } }) => {
    const rawForm = await extractFormData(request, signupFields)
    const signupData: SignupFormData = signupFormConverter(rawForm)
    let userId = null

    try {
      await signupHook.runBefore({ supabase, signupData })

      const { user } = await signup(supabase, signupData)
      userId = user.id

      await signupHook.runAfter({ supabase, signupData, userId })

      throw redirect(303, '/')
    } catch (error) {
      if (error instanceof SignUpError) {
        error.errorHandler()
        await signupHook.runCleanup({ supabase, signupData, userId })

        return fail(error.status, { error: error.details })
      }

      return fail(400, { error: '회원 가입 중 오류가 발생하였습니다.' })
    }
  },

  /**
   *
   * @param param0
   * @returns
   */
  signin: async ({ request, locals: { supabase } }) => {
    const rawForm = await extractFormData(request, signinFields)
    const signinData: SigninFormData = signinFormConverter(rawForm)

    try {
      await signin(supabase, signinData)

      throw redirect(303, '/admin')
    } catch (error) {
      if (error instanceof SignInError) {
        error.errorHandler()

        return fail(error.status, { error: error.details })
      }

      return fail(400, { error: '로그인 중 오류가 발생하였습니다.' })
    }
  },
}

/**
 *
 * @param supabase
 * @param signupData
 * @returns
 */
const signup = async (supabase: SupabaseClient, signupData: SignupFormData) => {
  const { email, name, phone1, phone2, phone3, password, storeId } = signupData

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password: password ?? '',
    options: {
      data: {
        display_name: name,
        phone: `${phone1}-${phone2}-${phone3}`,
        store_id: storeId || null,
      },
    },
  })

  if (error) {
    throw new SignUpError(`회원가입 실패: ${error?.message ?? '알 수 없는 오류'}`, {
      status: 400,
      code: 'signup_error',
      details: { error: '' },
    })
  }

  if (!user || !user.id) {
    throw new SignUpError('회원가입 실패: 사용자 없음', {
      status: 400,
      code: 'no_user_error',
      details: { error: '' },
    })
  }

  return { user }
}

/**
 *
 * @param supabase
 * @param signinData
 */
const signin = async (supabase: SupabaseClient, signinData: SigninFormData) => {
  const { data, error } = await supabase.auth.signInWithPassword({ ...signinData })

  if (error || !data.session) {
    console.log('signin error', error)
    throw new SignInError(error?.message || 'Invalid credentials', {
      status: 400,
      code: 'signin_error',
      details: { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
    })
  }
}
