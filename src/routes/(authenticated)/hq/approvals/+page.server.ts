import { toApprovalRequestEntities, toApprovalRequestEntity } from '$lib/converters/signup.converter'
import { toStoreEntities } from '$lib/converters/store.converter'
import { approveRequest, rejectRequest } from '$lib/database'
import { isAppError } from '$lib/errors'
import { ApprovalsFilterSchema as FilterSchema } from '$lib/schemas'
import { approveRequestHook, rejectRequestHook } from '$lib/services/hooks'
import { ApprovalStatus } from '$lib/types'
import { extractFormData } from '$lib/utils'
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
    const { status, storeId, dateFrom, dateTo, page, pageSize } = form.data

    if (!form.valid) fail(400, { form })

    let query = supabase
      .from('signup_approval_requests')
      .select(requestSelectQuery, { count: 'exact' })
      .not('store_id', 'is', null)

    if (status) query = query.eq('status', status)
    if (storeId) query = query.eq('store_id', storeId)
    if (dateFrom) query = query.gte('requested_at', dateFrom)
    if (dateTo) query = query.lte('requested_at', dateTo)

    // paginate 함수를 사용하도록 수정
    const { paginate } = await import('$lib/database/utils/pagination.util')
    const result = await paginate(query.order('created_at', { ascending: false }), { page, pageSize }).execute()

    return {
      form,
      requests: toApprovalRequestEntities(result.data),
      pagination: result.pagination,
    }
  },

  approve: async ({ request, locals: { user } }) => {
    const { id, storeId, userId } = await extractFormData(await request.formData(), ['id', 'storeId', 'userId'])

    if (!id || !user?.id || !storeId || !userId) {
      return fail(400, { message: '승인 요청 ID가 제공되지 않았습니다.' })
    }

    try {
      const { data } = await approveRequest(id, user.id)

      await approveRequestHook.runAfter({ storeId, userId })

      return { success: true, request: toApprovalRequestEntity(data) }
    } catch (error) {
      console.error('Error in approve action:', error)
      if (isAppError(error)) error.errorHandler()

      await approveRequestHook.runCleanup({ storeId, userId: user.id })
      return fail(500, { message: '승인 처리 중 오류가 발생했습니다.' })
    }
  },

  reject: async ({ request, locals: { user } }) => {
    const { id, storeId, userId } = await extractFormData(await request.formData(), ['id', 'storeId', 'userId'])

    if (!id || !user?.id || !storeId || !userId) {
      return fail(400, { message: '승인 요청 ID가 제공되지 않았습니다.' })
    }

    try {
      const { data } = await rejectRequest(id, user.id)

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
