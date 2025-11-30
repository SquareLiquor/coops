import type { ProfileEntity } from './user.entity'

// Store type enum
export type StoreType = 'hq' | 'branch'

// 스토어 기본 정보
export interface StoreEntity {
  id: string
  name: string
  type: StoreType
  address: string
  addressDetail: string
  addressType: 'ROAD' | 'JIBUN'
  roadAddress?: string
  jibunAddress?: string
  zipcode: string
  buildingName?: string
  latitude: number
  longitude: number
  phone?: string
  ownerId?: string
  owner?: ProfileEntity
  active: boolean
  createdAt?: string
  updatedAt?: string
}

// Public view interface (limited fields)
export interface StorePublicEntity {
  id: string
  name: string
  type: StoreType
  address?: string
  address_detail?: string
}

// Store members table interface
export interface StoreMemberEntity {
  id: string
  storeId: string
  userId: string
  store?: StoreEntity
  profile?: ProfileEntity
  createdAt?: string
}
