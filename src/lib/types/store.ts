// Store type enum
export type StoreType = 'hq' | 'branch'

// Complete stores table interface
export interface Store {
  id: string
  name: string
  type: StoreType
  address?: string
  address_detail?: string
  latitude?: number
  longitude?: number
  place_id?: string
  phone?: string
  owner_id?: string
  created_at?: string
  updated_at?: string
}

// Public view interface (limited fields)
export interface StorePublic {
  id: string
  name: string
  type: StoreType
  address?: string
  address_detail?: string
}

// Store members table interface
export interface StoreMember {
  id: string
  store_id: string
  user_id: string
  created_at?: string
}
