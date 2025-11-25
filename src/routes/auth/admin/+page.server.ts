import { signinFormConverter, signupFormConverter } from '$lib/converters/signup.converter'
import { toStoreEntities } from '$lib/converters/store.converter'
import { SignInError, SignUpError } from '$lib/errors'
import { signupHook } from '$lib/services/hooks'
import type { SigninFormData, SignupFormData } from '$lib/types'
import { extractFormData } from '$lib/utils/form'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fail, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

const signupFields = ['email', 'name', 'phone1', 'phone2', 'phone3', 'password', 'confirmPassword', 'store']
const signinFields = ['email', 'password']

/**
 *
 * @param param0
 * @returns
 */
export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data, error } = await supabase
    .from('stores_public')
    .select('*')
    .order('type', { ascending: true }) // 'hq' 먼저
    .order('name', { ascending: true }) // 이름순 정렬

  if (error) return { stores: [] }

  return { stores: toStoreEntities(data) }
}

export const actions: Actions = {
  /**
   *
   * @param param0
   * @returns
   */
  signup: async ({ request, locals: { supabase } }) => {
    const rawForm = await extractFormData(await request.formData(), signupFields)
    const signupData: SignupFormData = signupFormConverter(rawForm)
    let userId = null

    try {
      await signupHook.runBefore({ signupData })

      const { user } = await signup(supabase, signupData)
      userId = user.id

      await signupHook.runAfter({ signupData, userId })

      return { success: true, redirectTo: '/' } // redirect 대신 반환
      // throw redirect(303, '/')
    } catch (error) {
      if (error instanceof SignUpError) {
        error.errorHandler()
        await signupHook.runCleanup({ signupData, userId })

        return fail(error.status, { code: error.code, message: error.details?.message })
      }

      return fail(400, { code: 'signup_error', message: '회원 가입 중 오류가 발생하였습니다.' })
    }
  },

  /**
   *
   * @param param0
   * @returns
   */
  signin: async ({ request, locals: { supabase } }) => {
    const rawForm = await extractFormData(await request.formData(), signinFields)
    const signinData: SigninFormData = signinFormConverter(rawForm)

    try {
      await signin(supabase, signinData)

      return { success: true, redirectTo: '/' } // redirect 대신 반환
      // throw redirect(303, '/')
    } catch (error) {
      if (error instanceof SignInError) {
        error.errorHandler()

        return fail(error.status, { code: error.code, message: error.details?.message })
      }

      return fail(400, { code: 'signin_error', message: '로그인 중 오류가 발생하였습니다.' })
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
    throw new SignUpError(error?.code || 'signup_error', {
      status: 400,
      code: error.code,
      details: {
        message: error.message,
      },
    })
  }

  if (!user || !user.id) {
    throw new SignUpError('no_user_error', {
      status: 400,
      code: 'no_user_error',
      details: { message: '회원가입에 실패했습니다.' },
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
    throw new SignInError(error?.code || 'invalid_credentials', {
      status: 400,
      code: error?.code,
      details: { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
    })
  }
}
