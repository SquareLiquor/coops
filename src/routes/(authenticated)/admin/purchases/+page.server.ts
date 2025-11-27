import {
  getInitialPurchasesFilterValues as getInitialFilter,
  PurchaseCreateSchema,
  PurchasesFilterSchema,
  PurchaseStatusChangeSchema,
  PurchaseUpdateSchema,
} from '$lib/schemas'
import { getCategories } from '$lib/services/categories.service'
import { cancelPurchase, createPurchase, getPurchasesForStore, updatePurchase } from '$lib/services/purchases.service'
import { PurchaseStatus } from '$lib/types'
import { fail } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  const { store } = await parent()

  const initialFilter = getInitialFilter(store!.id)
  const filterForm = await superValidate(initialFilter, valibot(PurchasesFilterSchema))
  const createForm = await superValidate(valibot(PurchaseCreateSchema))
  const updateForm = await superValidate(valibot(PurchaseUpdateSchema))
  const statusChangeForm = await superValidate(valibot(PurchaseStatusChangeSchema))

  const { categories } = await getCategories(store!.id)
  const purchaseStatuses = [{ code: undefined, label: '전체' }, ...Object.values(PurchaseStatus)]

  return {
    filterForm,
    createForm,
    updateForm,
    statusChangeForm,
    categories,
    purchaseStatuses,
  }
}

export const actions: Actions = {
  fetch: async ({ request }) => {
    const form = await superValidate(request, valibot(PurchasesFilterSchema))
    if (!form.valid) return { form }

    try {
      const { purchases, pagination } = await getPurchasesForStore(form.data)

      return { form, purchases, pagination }
    } catch (error) {
      return { form }
    }
  },

  create: async ({ request }) => {
    const form = await superValidate(request, valibot(PurchaseCreateSchema))
    if (!form.valid) return fail(400, { form })

    try {
      await createPurchase(form.data)

      return message(form, '발주 신청이 완료되었습니다.')
    } catch (error) {
      return message(form, '발주 신청 중 오류가 발생했습니다.', { status: 400 })
    }
  },

  update: async ({ request }) => {
    const form = await superValidate(request, valibot(PurchaseUpdateSchema))
    if (!form.valid) return fail(400, { form })

    try {
      await updatePurchase(form.data)

      return message(form, '발주 정보가 수정되었습니다.')
    } catch (error) {
      return message(form, '발주 수정 중 오류가 발생했습니다.', { status: 500 })
    }
  },

  cancel: async ({ request }) => {
    const form = await superValidate(request, valibot(PurchaseStatusChangeSchema))
    const { id } = form.data
    if (!form.valid) return fail(400, { form })

    try {
      await cancelPurchase(id)

      return message(form, '발주가 취소되었습니다.')
    } catch (error) {
      return message(form, '발주 취소 중 오류가 발생했습니다.', { status: 500 })
    }
  },
}
