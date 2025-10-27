import type { StoreData } from '$lib/types'

let stoteState = $state<StoreData>()

const getStore = () => stoteState

const setStore = (store: StoreData | undefined) => {
  if (store) stoteState = store
}

export { getStore, setStore }
