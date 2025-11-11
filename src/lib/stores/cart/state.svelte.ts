import type { CartData, CartItemData } from '$lib/types/common/cart'

const initialState: CartData = {
  userId: '',
  storeId: '',
  totalPrice: 0,
  totalQuantity: 0,
  itemsCount: 0,
  items: [],
}

let cartState = $state<CartData>(initialState)

const getCart = () => cartState

const getCartItem = (coopId: string) => {
  return cartState.items.find((item) => item.coopId === coopId)
}

const hasCartItem = (coopId: string): boolean => {
  return cartState.items.some((item) => item.coopId === coopId)
}

const calculate = () => {
  const totalPrice = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQuantity = cartState.items.reduce((sum, item) => sum + item.quantity, 0)
  const itemsCount = cartState.items.length

  cartState = {
    ...cartState,
    totalPrice,
    totalQuantity,
    itemsCount,
  }
}

const addToCart = (item: CartItemData) => {
  cartState = {
    ...cartState,
    items: [...cartState.items, item],
  }

  calculate()
}

const updateCartItem = (id: string, quantity: number) => {
  cartState = {
    ...cartState,
    items: cartState.items.map((i) => (i.coopId === id ? { ...i, quantity: (i.quantity ?? 0) + quantity } : i)),
  }

  calculate()
}

const removeFromCart = (id: string) => {
  cartState = {
    ...cartState,
    items: cartState.items.filter((item) => item.coopId !== id),
  }

  calculate()
}

const clearCart = () => {
  cartState = initialState
}

export { addToCart, clearCart, getCart, getCartItem, hasCartItem, removeFromCart, updateCartItem }
