import { PurchaseRejectSchema, PurchasesFilterSchema, PurchaseStatusChangeSchema } from '$lib/schemas'
import { approvePurchase, getPurchasesForHQ, rejectPurchase, shipPurchase } from '$lib/services/purchases.service'
import { PurchaseStatus } from '$lib/types'
import { fail } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const filterForm = await superValidate(valibot(PurchasesFilterSchema))
  const actionForm = await superValidate(valibot(PurchaseStatusChangeSchema))
  const rejectForm = await superValidate(valibot(PurchaseRejectSchema))

  const purchaseStatuses = [{ code: undefined, label: '전체' }, ...Object.values(PurchaseStatus)]

  return {
    filterForm,
    actionForm,
    rejectForm,
    purchaseStatuses,
  }
}

export const actions: Actions = {
  fetch: async ({ request }) => {
    const form = await superValidate(request, valibot(PurchasesFilterSchema))
    if (!form.valid) return { form }

    try {
      const { purchases, pagination } = await getPurchasesForHQ(form.data)

      return { form, purchases, pagination }
    } catch (error) {
      return { form }
    }
  },

  approve: async ({ request }) => {
    const form = await superValidate(request, valibot(PurchaseStatusChangeSchema))
    if (!form.valid) return fail(400, { form })

    try {
      await approvePurchase(form.data.id)

      return message(form, '발주가 승인되었습니다.')
    } catch (error) {
      return message(form, '발주 승인 중 오류가 발생했습니다.', { status: 500 })
    }
  },

  reject: async ({ request }) => {
    const form = await superValidate(request, valibot(PurchaseRejectSchema))
    if (!form.valid) return fail(400, { form })

    try {
      await rejectPurchase(form.data.id, form.data.rejectionReason)

      return message(form, '발주가 거부되었습니다.')
    } catch (error) {
      return message(form, '발주 거부 중 오류가 발생했습니다.', { status: 500 })
    }
  },

  ship: async ({ request }) => {
    const form = await superValidate(request, valibot(PurchaseStatusChangeSchema))
    if (!form.valid) return fail(400, { form })

    try {
      await shipPurchase(form.data.id)

      return message(form, '발주가 출고되었습니다.')
    } catch (error) {
      return message(form, '발주 출고 중 오류가 발생했습니다.', { status: 500 })
    }
  },
}
