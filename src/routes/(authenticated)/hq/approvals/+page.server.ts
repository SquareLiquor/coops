import { toApprovalRequestEntities, toApprovalRequestEntity } from '$lib/converters/signup.converter'
import { toStoreEntities } from '$lib/converters/store.converter'
import { ApprovalError, isAppError } from '$lib/errors'
import { ApprovalsFilterSchema as FilterSchema } from '$lib/schemas'
import { approveRequestHook, rejectRequestHook } from '$lib/services/hooks'
import { ApprovalStatus } from '$lib/types'
import { extractFormData } from '$lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

const requestSelectQuery = `
  *,
  applicant:applicant_id (*),
  approver:approver_id (*),
  store:store_id (*)
`

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const filterForm = await superValidate({}, valibot(FilterSchema))

  const { data, error } = await supabase
    .from('stores_public')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  const stores = toStoreEntities(data)
  const statuses = [{ code: undefined, label: '전체' }, ...Object.values(ApprovalStatus)]

  return {
    filterForm,
    stores,
    statuses,
  }
}

export const actions: Actions = {
  fetch: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(FilterSchema))
    const { status, storeId, dateFrom, dateTo } = form.data

    if (!form.valid) fail(400, { form })

    const query = supabase
      .from('signup_approval_requests')
      .select(requestSelectQuery, { count: 'exact' })
      .not('store_id', 'is', null)
      .order('created_at', { ascending: false })

    if (status) query.eq('status', status)
    if (storeId) query.eq('store_id', storeId)
    if (dateFrom) query.gte('requested_at', dateFrom)
    if (dateTo) query.lte('requested_at', dateTo)

    const { data } = await query

    return {
      form,
      requests: toApprovalRequestEntities(data),
    }
  },

  approve: async ({ request, locals: { supabase, user } }) => {
    const { id, storeId, userId } = await extractFormData(await request.formData(), ['id', 'storeId', 'userId'])

    if (!id || !user?.id || !storeId || !userId) {
      return fail(400, { message: '승인 요청 ID가 제공되지 않았습니다.' })
    }

    try {
      const { data } = await approve(supabase, id, user.id)

      await approveRequestHook.runAfter({ storeId, userId })

      return { success: true, request: toApprovalRequestEntity(data) }
    } catch (error) {
      console.error('Error in approve action:', error)
      if (isAppError(error)) error.errorHandler()

      await approveRequestHook.runCleanup({ storeId, userId: user.id })
      return fail(500, { message: '승인 처리 중 오류가 발생했습니다.' })
    }
  },

  reject: async ({ request, locals: { supabase, user } }) => {
    const { id, storeId, userId } = await extractFormData(await request.formData(), ['id', 'storeId', 'userId'])

    if (!id || !user?.id || !storeId || !userId) {
      return fail(400, { message: '승인 요청 ID가 제공되지 않았습니다.' })
    }

    try {
      const { data } = await reject(supabase, id, user.id)

      await rejectRequestHook.runAfter({ storeId, userId })

      return { success: true, request: toApprovalRequestEntity(data) }
    } catch (error) {
      console.error('Error in reject action:', error)
      if (isAppError(error)) error.errorHandler()

      await rejectRequestHook.runCleanup({ storeId, userId: user.id })
      return fail(500, { message: '거부 처리 중 오류가 발생했습니다.' })
    }
  },
}

const approve = async (supabase: SupabaseClient, id: string, userId: string) => {
  const { data, error } = await supabase
    .from('signup_approval_requests')
    .update({
      status: ApprovalStatus.APPROVED.code,
      approver_id: userId,
      reason: '사용자 확인 완료',
      approved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(requestSelectQuery)
    .maybeSingle()

  if (error) {
    throw new ApprovalError('승인 처리 중 오류가 발생했습니다.', {
      code: 'APPROVAL_PROCESSING_FAILED',
      details: { error: error.message },
    })
  }

  return { data }
}

const reject = async (supabase: SupabaseClient, id: string, userId: string) => {
  const { data, error } = await supabase
    .from('signup_approval_requests')
    .update({
      status: ApprovalStatus.REJECTED.code,
      approver_id: userId,
      reason: '사용자 확인 불가',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(requestSelectQuery)
    .maybeSingle()

  if (error) {
    throw new ApprovalError('거부 처리 중 오류가 발생했습니다.', {
      code: 'REJECTION_PROCESSING_FAILED',
      details: { error: error.message },
    })
  }

  return { data }
}
