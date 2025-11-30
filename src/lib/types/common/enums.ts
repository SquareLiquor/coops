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

export type UnitType = EnumItem
export const UnitType: { [key: string]: UnitType } = {
  EA: { code: 'EA', label: '개' },
  BOX: { code: 'BOX', label: '박스' },
  PACK: { code: 'PACK', label: '팩' },
  SET: { code: 'SET', label: '세트' },
  BAG: { code: 'BAG', label: '봉지' },
}

export type ApprovalStatus = EnumItem & { badgeClass?: string }
export const ApprovalStatus: { [key: string]: ApprovalStatus } = {
  PENDING: { code: 'pending', label: '승인 대기', badgeClass: 'text-warning-800 bg-warning-100' },
  APPROVED: { code: 'approved', label: '승인 완료', badgeClass: 'text-success-800 bg-success-100' },
  REJECTED: { code: 'rejected', label: '승인 거부', badgeClass: 'text-error-800 bg-error-100' },
}

export type SalesStatus = EnumItem & { badgeClass?: string }
export const SalesStatus: { [key: string]: SalesStatus } = {
  PREPARING: { code: 'PREPARING', label: '판매 준비', badgeClass: 'text-sky-800 bg-sky-100' },
  ONGOING: { code: 'ONGOING', label: '판매 진행', badgeClass: 'text-primary-800 bg-primary-100' },
  ENDED: { code: 'ENDED', label: '판매 종료', badgeClass: 'text-surface-800 bg-surface-100' },
  COMPLETED: { code: 'COMPLETED', label: '판매 완료', badgeClass: 'text-success-800 bg-success-100' },
  STOPPED: { code: 'STOPPED', label: '판매 중지', badgeClass: 'text-error-800 bg-error-100' },
  PAUSED: { code: 'PAUSED', label: '판매 일시 정지', badgeClass: 'text-warning-800 bg-warning-100' },
}

export type OrderStatus = EnumItem & { badgeClass?: string }
export const OrderStatus: { [key: string]: OrderStatus } = {
  CREATED: { code: 'CREATED', label: '주문 생성', badgeClass: 'text-tertiary-800 bg-tertiary-100' },
  COMPLETED: { code: 'COMPLETED', label: '주문 완료', badgeClass: 'text-success-800 bg-success-100' },
  CANCELLED: { code: 'CANCELLED', label: '주문 취소', badgeClass: 'text-error-800 bg-error-100' },
  PARTIAL_CANCELLED: { code: 'PARTIAL_CANCELLED', label: '부분 취소', badgeClass: 'text-warning-800 bg-warning-100' },
}

export type PurchaseStatus = EnumItem & { badgeClass?: string }
export const PurchaseStatus: { [key: string]: PurchaseStatus } = {
  REQUESTED: { code: 'REQUESTED', label: '요청', badgeClass: 'text-tertiary-800 bg-tertiary-100' },
  APPROVED: { code: 'APPROVED', label: '승인', badgeClass: 'text-primary-800 bg-primary-100' },
  DELIVERY_STARTED: { code: 'DELIVERY_STARTED', label: '출고', badgeClass: 'text-secondary-800 bg-secondary-100' },
  DELIVERED: { code: 'DELIVERED', label: '입고', badgeClass: 'text-success-800 bg-success-100' },
  REJECTED: { code: 'REJECTED', label: '거부', badgeClass: 'text-error-800 bg-error-100' },
  CANCELLED: { code: 'CANCELLED', label: '취소', badgeClass: 'text-surface-800 bg-surface-100' },
}

export type AddressType = EnumItem
export const AddressType: { [key: string]: AddressType } = {
  ROAD: { code: 'ROAD', label: '도로명' },
  JIBUN: { code: 'JIBUN', label: '지번' },
}