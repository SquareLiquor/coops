import { approvalRequestDataConverter, storeDataConverter } from '$lib/converters'
import { ApprovalError, isAppError } from '$lib/errors'
import { approveRequestHook, rejectRequestHook } from '$lib/hooks'

import { ApprovalSchema, ApprovalsFilterSchema as FilterSchema } from '$lib/schemas'
import { ApprovalStatus } from '$lib/types'
import { extractFormData } from '$lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fail, type Actions } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { PageServerLoad } from './$types'

const { convertAll: storeConvertAll } = storeDataConverter()
const { convert, convertAll } = approvalRequestDataConverter()

const requestSelectQuery = `
  *,
  applicant:applicant_id (*),
  approver:approver_id (*),
  store:store_id (*)
`

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const filterForm = await superValidate(valibot(FilterSchema))
  const approvalForm = await superValidate(valibot(ApprovalSchema))

  const { data, error } = await supabase
    .from('stores_public')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  const stores = error ? [] : storeConvertAll(data)
  const statusOptions = [{ code: undefined, label: '전체' }, ...Object.values(ApprovalStatus)]

  return {
    filterForm,
    approvalForm,
    stores,
    statusOptions,
  }
}

export const actions: Actions = {
  fetch: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, valibot(FilterSchema))
    const { status, store_id, date_from, date_to } = form.data

    if (!form.valid) fail(400, { form })

    const query = supabase
      .from('signup_approval_requests')
      .select(requestSelectQuery, { count: 'exact' })
      .not('store_id', 'is', null)
      .order('created_at', { ascending: false })

    if (status) query.eq('status', status)
    if (store_id) query.eq('store_id', store_id)
    if (date_from) query.gte('requested_at', date_from)
    if (date_to) query.lte('requested_at', date_to)

    const { data } = await query

    return {
      form,
      requests: data ? convertAll(data) : [],
    }
  },

  approve: async ({ request, locals: { supabase, user } }) => {
    const { id, store_id, user_id } = await extractFormData(await request.formData(), ['id', 'store_id', 'user_id'])

    if (!id || !user?.id || !store_id || !user_id) {
      return fail(400, { message: '승인 요청 ID가 제공되지 않았습니다.' })
    }

    try {
      const { data } = await approve(supabase, id, user.id)

      await approveRequestHook.runAfter({ storeId: store_id, userId: user_id })

      return { success: true, request: convert(data) }
    } catch (error) {
      console.error('Error in approve action:', error)
      if (isAppError(error)) {
        error.errorHandler()
        await approveRequestHook.runCleanup({ storeId: store_id, userId: user.id })
      }

      return fail(500, { message: '승인 처리 중 오류가 발생했습니다.' })
    }
  },

  reject: async ({ request, locals: { supabase, user } }) => {
    const { id, store_id, user_id } = await extractFormData(await request.formData(), ['id', 'store_id', 'user_id'])

    if (!id || !user?.id || !store_id || !user_id) {
      return fail(400, { message: '승인 요청 ID가 제공되지 않았습니다.' })
    }

    try {
      const { data } = await reject(supabase, id, user.id)

      await rejectRequestHook.runAfter({ storeId: store_id, userId: user_id })

      return { success: true, request: convert(data) }
    } catch (error) {
      console.error('Error in reject action:', error)
      if (isAppError(error)) {
        error.errorHandler()
        await rejectRequestHook.runCleanup({ storeId: store_id, userId: user.id })
      }

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
