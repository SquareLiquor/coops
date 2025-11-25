import { createBrowserClient, createServerClient } from '$lib/database'
import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import { isBrowser } from '@supabase/ssr'
import type { CreateCoopHookContext } from '../createCoop.context'

const deleteCoop = async (context: CreateCoopHookContext, shared: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const coopId = shared.get('coopId')
  if (!coopId) return

  const { data, error } = await supabase.from('coops').delete().eq('id', coopId)

  if (error) throw new SupabaseError('Failed to delete coop during cleanup')
}

export const deleteCoopHook: HookContext<CreateCoopHookContext> = {
  cleanup: deleteCoop,
}
