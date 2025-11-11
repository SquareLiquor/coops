import { SupabaseError } from '$lib/errors'
import type { HookContext } from '$lib/hooks/hooksManager'
import { createBrowserClient, createServerClient } from '$lib/supabase'
import type { CreateOrderHookContext } from '$lib/types'
import { isBrowser } from '@supabase/ssr'

const deleteOrder = async (shared: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const orderId = shared.get('orderId')
  const { data, error } = await supabase.from('orders').delete().eq('id', orderId)

  if (error) throw new SupabaseError('ORDER_DELETION_FAILED', { details: { error: error.message } })
}

export const deleteOrderHook: HookContext<CreateOrderHookContext> = {
  cleanup: deleteOrder,
}
