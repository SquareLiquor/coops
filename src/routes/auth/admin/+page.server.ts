import type { StorePublic } from '$lib/types'
import { getRequestFormData } from '$lib/utils/form'
import { fail, redirect, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

const signupFields = ['email', 'name', 'phone1', 'phone2', 'phone3', 'password', 'confirmPassword', 'store']
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
    const { email, name, phone1, phone2, phone3, password, confirmPassword, store } = await getRequestFormData(
      request,
      signupFields
    )

    const [store_type, store_id] = store.split('|')

    // Business logic validation only
    const errors: Record<string, string> = {}

    // Only validate phone number format (business logic)
    if (phone2 && phone2.length !== 4) {
      errors.phone2 = '전화번호 두 번째 부분은 4자리여야 합니다.'
    }

    if (phone3 && phone3.length !== 4) {
      errors.phone3 = '전화번호 세 번째 부분은 4자리여야 합니다.'
    }

    // Only validate password confirmation match (business logic)
    if (password !== confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    // Return errors if any exist
    if (Object.keys(errors).length > 0) {
      return fail(400, { errors })
    }

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone: `${phone1}-${phone2}-${phone3}`,
        },
      },
    })

    if (signupError) {
      console.log('signup error', signupError)
      return fail(400, { error: '회원가입 실패: ' + (signupError?.message ?? '알 수 없는 오류') })
    }

    if (!signupData.user || !signupData.user.id) {
      console.log('signup error', signupError)
      return fail(400, { error: '회원가입 실패: ' + '권한 부여 에러' })
    }

    const { data: grantData, error: grantError } = await supabase.functions.invoke('grant_user_role', {
      method: 'POST',
      body: {
        user_id: signupData.user.id,
        store_type,
        store_id,
      },
    })

    if (grantError) {
      console.log('grant error', grantError)
      return fail(400, { error: '회원가입 실패: ' + (grantError?.message ?? '알 수 없는 오류') })
    }

    return {
      success: true,
      message: '회원가입이 완료되었습니다. 승인 후 서비스를 이용할 수 있습니다.',
    }
  },

  signin: async ({ request, locals: { supabase } }) => {
    const { email, password } = await getRequestFormData(request, signinFields)

    // No validation needed - HTML handles required fields and email format

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      console.log('signin error', error)
      return fail(401, { error: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    }

    throw redirect(303, '/admin')
  },
}
