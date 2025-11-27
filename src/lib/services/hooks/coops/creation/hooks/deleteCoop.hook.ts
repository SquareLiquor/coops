import { deleteCoop as deleteCoopService } from '$lib/services/coops.service'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import type { CreateCoopHookContext } from '../createCoop.context'

const deleteCoop = async (context: CreateCoopHookContext, shared: any) => {
  const coopId = shared.get('coopId')
  if (!coopId) return

  await deleteCoopService(coopId)
}

export const deleteCoopHook: HookContext<CreateCoopHookContext> = {
  cleanup: deleteCoop,
}
