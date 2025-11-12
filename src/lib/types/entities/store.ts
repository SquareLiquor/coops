import type { ProfileData } from './user'

// Store type enum
export type StoreType = 'hq' | 'branch'

// 스토어 기본 정보
export interface StoreData {
  id: string
  name: string
  type: StoreType
  address?: string
  addressDetail?: string
  latitude?: number
  longitude?: number
  placeId?: string
  phone?: string
  ownerId?: string
  owner?: ProfileData
  createdAt?: string
  updatedAt?: string
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
export interface StoreMemberData {
  id: string
  storeId: string
  userId: string
  store?: StoreData
  profile?: ProfileData
  createdAt?: string
}
