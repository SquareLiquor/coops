type EnumItem = {
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
  PREPARING: { code: 'PREPARING', label: '판매 준비', color: 'gray' },
  ONGOING: { code: 'ONGOING', label: '판매 진행', color: 'green' },
  ENDED: { code: 'ENDED', label: '판매 종료', color: 'blue' },
  COMPLETED: { code: 'COMPLETED', label: '판매 완료', color: 'yellow' },
  STOPPED: { code: 'STOPPED', label: '판매 중지', color: 'red' },
  PAUSED: { code: 'PAUSED', label: '판매 일시 정지', color: 'orange' },
}

export type OrderStatus = EnumItem & { color?: string }
export const OrderStatus: { [key: string]: OrderStatus } = {
  CREATED: { code: 'CREATED', label: '주문 생성', color: 'green' },
  COMPLETED: { code: 'COMPLETED', label: '픽업 완료', color: 'blue' },
  CANCELLED: { code: 'CANCELLED', label: '주문 취소', color: 'red' },
  PARTIAL_CANCELLED: { code: 'PARTIAL_CANCELLED', label: '부분 취소', color: 'red' },
}

export const lookupEnum = <T extends EnumItem>(enumObj: { [key: string]: T }, code: string): T | undefined => {
  return Object.values(enumObj).find((item) => item.code === code)
}

export const equalsEnum = (a?: EnumItem | null, b?: EnumItem | null): boolean => {
  if (!a || !b) return false
  return a.code === b.code
}
