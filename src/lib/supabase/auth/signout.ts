import { isBrowser } from '@supabase/ssr'
import { createBrowserClient, createServerClient } from '../clients'

export const signout = async () => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  await supabase.auth.signOut()
}
