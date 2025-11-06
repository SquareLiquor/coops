import type { StoreData } from '$lib/types'
import { isBrowser } from '@supabase/ssr'

let storeState = $state<StoreData>()

const getStore = () => {
  if (!isBrowser()) return null
  const json = localStorage.getItem('store')
  return json ? JSON.parse(json) : null
}

const setStore = (store: StoreData | undefined) => {
  if (isBrowser()) localStorage.setItem('store', JSON.stringify(store))
}

const clearStore = () => {
  storeState = undefined
}

export { clearStore, getStore, setStore }
