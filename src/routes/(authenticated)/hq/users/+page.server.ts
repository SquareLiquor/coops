import { approvalRequestDataConverter } from '$lib/converters'
import { ApprovalStatus } from '$lib/types'
import { extractFormData } from '$lib/utils'
import { fail, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

const { convert, convertAll } = approvalRequestDataConverter()

export const load: PageServerLoad = async ({ locals }) => {
  const { data } = await locals.supabase
    .from('signup_approval_requests')
    .select(
      `*,
        applicant:applicant_id (*),
        approver:approver_id (*),
        store:store_id (*)
      `
    )
    .not('store_id', 'is', null)
    .order('created_at', { ascending: false })

  return {
    requests: data ? convertAll(data) : [],
    statusOptions: Object.values(ApprovalStatus),
  }
}

export const actions: Actions = {
  approve: async ({ request, locals: { supabase, user } }) => {
    const { id } = await extractFormData(await request.formData(), ['id'])

    if (!id || !user?.id) {
      return fail(400, { message: '승인 요청 ID가 제공되지 않았습니다.' })
    }

    const { data, error } = await supabase
      .from('signup_approval_requests')
      .update({
        status: ApprovalStatus.APPROVED.code,
        approver_id: user.id,
        reason: '사용자 확인 완료',
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `*,
        applicant:applicant_id (*),
        approver:approver_id (*),
        store:store_id (*)
      `
      )
      .maybeSingle()

    if (error) {
      return fail(500, { message: '승인 처리 중 오류가 발생했습니다.' })
    }

    return { success: true, request: convert(data) }
  },
  reject: async ({ request, locals: { supabase, user } }) => {
    const { id } = await extractFormData(await request.formData(), ['id'])

    if (!id || !user?.id) {
      return fail(400, { message: '승인 요청 ID가 제공되지 않았습니다.' })
    }

    const { data, error } = await supabase
      .from('signup_approval_requests')
      .update({
        status: ApprovalStatus.REJECTED.code,
        approver_id: user.id,
        reason: '사용자 확인 불가',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `*,
        applicant:applicant_id (*),
        approver:approver_id (*),
        store:store_id (*)
      `
      )
      .maybeSingle()

    if (error) {
      return fail(500, { message: '거부 처리 중 오류가 발생했습니다.' })
    }

    return { success: true, request: convert(data) }
  },
}
