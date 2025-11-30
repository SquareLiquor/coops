export type EnumItem = {
  code: string
  label: string
}

export type UserType = EnumItem
export const UserType: { [key: string]: EnumItem } = {
  CONSUMER: { code: 'consumer', label: '소비자' },
  BRANCH: { code: 'branch', label: '지점' },
  HQ: { code: 'hq', label: '본사' },
}

export type ApprovalStatus = EnumItem & { color?: string }
export const ApprovalStatus: { [key: string]: ApprovalStatus } = {
  PENDING: { code: 'pending', label: '승인 대기', color: 'warning' },
  APPROVED: { code: 'approved', label: '승인 완료', color: 'success' },
  REJECTED: { code: 'rejected', label: '승인 거부', color: 'error' },
}

export type UnitType = EnumItem
export const UnitType: { [key: string]: UnitType } = {
  EA: { code: 'EA', label: '개' },
  BOX: { code: 'BOX', label: '박스' },
  PACK: { code: 'PACK', label: '팩' },
  SET: { code: 'SET', label: '세트' },
  BAG: { code: 'BAG', label: '봉지' },
}

export type SalesStatus = EnumItem & { color?: string }
export const SalesStatus: { [key: string]: SalesStatus } = {
  PREPARING: { code: 'PREPARING', label: '판매 준비', color: 'sky' },
  ONGOING: { code: 'ONGOING', label: '판매 진행', color: 'primary' },
  ENDED: { code: 'ENDED', label: '판매 종료', color: 'surface' },
  COMPLETED: { code: 'COMPLETED', label: '판매 완료', color: 'success' },
  STOPPED: { code: 'STOPPED', label: '판매 중지', color: 'error' },
  PAUSED: { code: 'PAUSED', label: '판매 일시 정지', color: 'warning' },
}

export type OrderStatus = EnumItem & { color?: string }
export const OrderStatus: { [key: string]: OrderStatus } = {
  CREATED: { code: 'CREATED', label: '주문 생성', color: 'tertiary' },
  COMPLETED: { code: 'COMPLETED', label: '주문 완료', color: 'success' },
  CANCELLED: { code: 'CANCELLED', label: '주문 취소', color: 'error' },
  PARTIAL_CANCELLED: { code: 'PARTIAL_CANCELLED', label: '부분 취소', color: 'warning' },
}

export type PurchaseStatus = EnumItem & { color?: string }
export const PurchaseStatus: { [key: string]: PurchaseStatus } = {
  REQUESTED: { code: 'REQUESTED', label: '요청', color: 'tertiary' },
  APPROVED: { code: 'APPROVED', label: '승인', color: 'primary' },
  DELIVERY_STARTED: { code: 'DELIVERY_STARTED', label: '출고', color: 'secondary' },
  DELIVERED: { code: 'DELIVERED', label: '입고', color: 'success' },
  REJECTED: { code: 'REJECTED', label: '거부', color: 'error' },
  CANCELLED: { code: 'CANCELLED', label: '취소', color: 'surface' },
}

export type AddressType = EnumItem
export const AddressType: { [key: string]: AddressType } = {
  ROAD: { code: 'ROAD', label: '도로명' },
  JIBUN: { code: 'JIBUN', label: '지번' },
}