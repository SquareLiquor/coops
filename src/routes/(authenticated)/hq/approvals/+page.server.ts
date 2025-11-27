import { toApprovalRequestEntities, toApprovalRequestEntity } from '$lib/converters/signup.converter'
import { isAppError } from '$lib/errors'
import { ApprovalsFilterSchema as FilterSchema } from '$lib/schemas'
import { approveRequest, getApprovalRequests, rejectRequest } from '$lib/services/auth.service'
import { approveRequestHook, rejectRequestHook } from '$lib/services/hooks'
import { getStores } from '$lib/services/stores.service'
import { ApprovalStatus } from '$lib/types'
import { extractFormData } from '$lib/utils'
import { fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const filterForm = await superValidate({}, valibot(FilterSchema))

  const { stores } = await getStores()
  const statuses = [{ code: undefined, label: '전체' }, ...Object.values(ApprovalStatus)]

  return {
    filterForm,
    stores,
    statuses,
  }
}

export const actions: Actions = {
  fetch: async ({ request }) => {
    const form = await superValidate(request, valibot(FilterSchema))
    const { status, storeId, dateFrom, dateTo, page, pageSize } = form.data

    if (!form.valid) return fail(400, { form })

    try {
      const result = await getApprovalRequests({ status, storeId, dateFrom, dateTo, page, pageSize })

      return {
        form,
        requests: toApprovalRequestEntities(result.data),
        pagination: result.pagination,
      }
    } catch (error) {
      console.error('Error fetching approval requests:', error)
      return fail(500, {
        form,
        alert: { type: 'error', title: '조회 실패', message: '승인 요청 목록을 불러오는 중 오류가 발생했습니다.' },
      })
    }
  },

  approve: async ({ request, locals: { user } }) => {
    const { id, storeId, userId } = await extractFormData(await request.formData(), ['id', 'storeId', 'userId'])

    if (!id || !user?.id || !storeId || !userId) {
      return fail(400, {
        alert: { type: 'error', title: '승인 실패', message: '필수 정보가 누락되었습니다.' },
      })
    }

    try {
      const { data } = await approveRequest(id, user.id)
      await approveRequestHook.runAfter({ storeId, userId })

      return {
        success: true,
        request: toApprovalRequestEntity(data),
        alert: { type: 'success', title: '승인 완료', message: '사용자 가입 승인이 완료되었습니다.' },
      }
    } catch (error) {
      console.error('Error in approve action:', error)
      if (isAppError(error)) error.errorHandler()

      await approveRequestHook.runCleanup({ storeId, userId: user.id })
      return fail(500, {
        alert: { type: 'error', title: '승인 실패', message: '승인 처리 중 오류가 발생했습니다. 다시 시도해주세요.' },
      })
    }
  },

  reject: async ({ request, locals: { user } }) => {
    const { id, storeId, userId } = await extractFormData(await request.formData(), ['id', 'storeId', 'userId'])

    if (!id || !user?.id || !storeId || !userId) {
      return fail(400, {
        alert: { type: 'error', title: '거부 실패', message: '필수 정보가 누락되었습니다.' },
      })
    }

    try {
      const { data } = await rejectRequest(id, user.id)
      await rejectRequestHook.runAfter({ storeId, userId })

      return {
        success: true,
        request: toApprovalRequestEntity(data),
        alert: { type: 'warning', title: '거부 완료', message: '사용자 가입이 거부되었습니다.' },
      }
    } catch (error) {
      console.error('Error in reject action:', error)
      if (isAppError(error)) error.errorHandler()

      await rejectRequestHook.runCleanup({ storeId, userId: user.id })
      return fail(500, {
        alert: { type: 'error', title: '거부 실패', message: '거부 처리 중 오류가 발생했습니다. 다시 시도해주세요.' },
      })
    }
  },
}
