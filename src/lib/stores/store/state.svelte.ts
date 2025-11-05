import type { StoreData } from '$lib/types'

let storeState = $state<StoreData>()

const getStore = () => storeState

const setStore = (store: StoreData | undefined) => {
  if (store) storeState = store
}

export { getStore, setStore }
