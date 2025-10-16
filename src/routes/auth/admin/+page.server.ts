import { SignUpError } from '$lib/errors'
import { signupHook } from '$lib/hooks/'
import type { SignupContext, SignupFormData, StorePublic } from '$lib/types'
import { extractFormFields } from '$lib/utils/form'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fail, redirect, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

const signupFields = ['email', 'name', 'phone1', 'phone2', 'phone3', 'password', 'confirmPassword', 'storeId']
const signinFields = ['email', 'password']

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: stores, error } = await supabase
    .from('stores_public')
    .select('*')
    .order('type', { ascending: true }) // 'hq' 먼저
    .order('name', { ascending: true }) // 이름순 정렬

  if (error) {
    console.error('Error loading stores:', error)
    return {
      stores: [] as StorePublic[],
    }
  }

  return {
    stores: (stores || []) as StorePublic[],
  }
}

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = (await extractFormFields(request, signupFields)) as SignupFormData

    try {
      await signupHook.runBefore({ formData })

      const { data } = await signUp(formData, supabase)

      await signupHook.runAfter({ formData, createdUser: data.user })

      return redirect(303, '/')
    } catch (error) {
      if (error instanceof SignUpError) {
        console.error(error.message)
        // await supabase.auth.admin.deleteUser(data?.user?.id ?? '')
        signupHook.runCleanup({ formData })

        const { status, details } = error

        return fail(status, { error: details })
      }

      return fail(400, { error: '회원 가입 중 오류가 발생하였습니다.' })
    }
  },

  signin: async ({ request, locals: { supabase } }) => {
    const { email, password } = await extractFormFields(request, signinFields)

    // No validation needed - HTML handles required fields and email format
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      console.log('signin error', error)
      return fail(401, { error: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    }

    throw redirect(303, '/admin')
  },
}

const signUp = async (formData: SignupFormData, supabase: SupabaseClient) => {
  const { email, name, phone1, phone2, phone3, password } = formData

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
        phone: `${phone1}-${phone2}-${phone3}`,
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

  if (!data.user || !data.user.id) {
    throw new SignUpError('회원가입 실패: 사용자 없음', {
      status: 400,
      code: 'no_user_error',
      details: { error: '' },
    })
  }

  return { data }
}

const signIn = async ({ formData }: SignupContext, supabase: SupabaseClient) => {}
