import type { StoreData } from '$lib/types'
import { isBrowser } from '@supabase/ssr'

let storeState = $state<StoreData>()

const getStore = () => {
  if (isBrowser()) {
    const json = localStorage.getItem('store')
    if (json) return JSON.parse(json)
  }

  return storeState
}

const setStore = (store: StoreData | undefined) => {
  if (isBrowser()) localStorage.setItem('store', JSON.stringify(store))
  storeState = store
}

const clearStore = () => {
  if (isBrowser()) localStorage.removeItem('store')
  storeState = undefined
}

export { clearStore, getStore, setStore }
