import { type StoreEntity } from '$lib/types'
import * as v from 'valibot'

export const AddressSchema = v.object({
  address: v.pipe(v.string(), v.minLength(1, '주소를 선택해주세요.')),
  addressDetail: v.string(),
  addressType: v.picklist(['ROAD', 'JIBUN']),
  roadAddress: v.optional(v.string()),
  jibunAddress: v.optional(v.string()),
  zipcode: v.string(),
  buildingName: v.optional(v.string()),
  latitude: v.number(),
  longitude: v.number(),
})

export const StoreSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, '매장명을 입력해주세요.')),
  type: v.picklist(['hq', 'branch']),
  phone: v.pipe(v.string(), v.minLength(1, '전화번호를 입력해주세요.')),
  address: v.object({...AddressSchema.entries}),
  active: v.optional(v.boolean(), true),
})

export const StoreCreateSchema = v.object({
  ...StoreSchema.entries,
})

export const StoreUpdateSchema = v.object({
  id: v.string(),
  ...StoreSchema.entries,
})

export type AddressInput = v.InferInput<typeof AddressSchema>
export type StoreCreateInput = v.InferInput<typeof StoreCreateSchema>
export type StoreUpdateInput = v.InferInput<typeof StoreUpdateSchema>

export const createInitialStoreValues = (): Partial<StoreCreateInput> => {
  return {
    type: 'branch',
  }
}

export const createInitialAddressValues = (): Partial<AddressInput> => {
  return {
    addressType: 'ROAD',
  }
}

export const storeDataToUpdateInput = (store: StoreEntity): StoreUpdateInput => {
  return {
    id: store.id,
    name: store.name,
    type: store.type,
    phone: store.phone || '',
    address: {
      address: store.address || '',
      addressDetail: store.addressDetail || '',
      addressType: store.addressType || 'ROAD',
      roadAddress: store.roadAddress || '',
      jibunAddress: store.jibunAddress || '',
      zipcode: store.zipcode || '',
      buildingName: store.buildingName || '',
      latitude: store.latitude || 0,
      longitude: store.longitude || 0,
    },
    active: store.active
  }
}
