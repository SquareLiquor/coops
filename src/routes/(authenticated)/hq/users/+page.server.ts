import { approvalRequestDataConverter } from '$lib/converters'
import { ApprovalStatus } from '$lib/types'
import { extractFormData } from '$lib/utils'
import { fail, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

const { convert, convertAll } = approvalRequestDataConverter()

const searchFormFields = ['status', 'name', 'date_from', 'date_to'] // pagination
const requestSelectQuery = `
  *,
  applicant:applicant_id (*),
  approver:approver_id (*),
  store:store_id (*)
`

export const load: PageServerLoad = async () => {
  const statusOptions = [{ code: 'all', label: '전체' }, ...Object.values(ApprovalStatus)]

  return {
    statusOptions
  }
}

export const actions: Actions = {
  fetch: async ({ request, locals: { supabase } }) => {
    const { status, name, date_from, date_to } = await extractFormData(await request.formData(), searchFormFields)
    console.log(status, name, date_from, date_to)
    const query = supabase
      .from('signup_approval_requests')
      .select(requestSelectQuery, { count: 'exact' })
      .not('store_id', 'is', null)

    // TODO: search form
    if (status !== 'all') query.eq('status', status)
    if (name) query.or(`applicant.name.ilike.%${name}%,store.name.ilike.%${name}%`) // TODO: like, or 조건 확인 필요
    if (date_from) query.gte('requested_at', date_from)
    if (date_to) query.lte('requested_at', date_to)

    // convert form data
    const { data } = await query.order('created_at', { ascending: false })

    return { success: true, requests: data ? convertAll(data) : [] }
  },
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
      .select(requestSelectQuery)
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
      .select(requestSelectQuery)
      .maybeSingle()

    if (error) {
      return fail(500, { message: '거부 처리 중 오류가 발생했습니다.' })
    }

    return { success: true, request: convert(data) }
  },
}
