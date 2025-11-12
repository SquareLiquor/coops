import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createBrowserClient, createServerClient } from '$lib/supabase'
import type { CreateCoopHookContext } from '$lib/types'
import { isBrowser } from '@supabase/ssr'

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
