import { toPurchaseEntities } from '$lib/converters/purchase.converter'
import { getPurchasesForStore as _getPurchasesForStore } from '$lib/database'
import type { PurchasesFilterInput } from '$lib/schemas'

export const getPurchasesForStore = async (filter: PurchasesFilterInput) => {
  const { purchases } = await _getPurchasesForStore(filter)

  return { purchases: toPurchaseEntities(purchases) }
}

export const getPurchasesForHQ = async () => {}
