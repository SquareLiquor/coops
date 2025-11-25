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
  PREPARING: { code: 'PREPARING', label: '판매 준비', color: 'green' }, // gray: 준비중
  ONGOING: { code: 'ONGOING', label: '판매 진행', color: 'blue' }, // green: 진행중
  ENDED: { code: 'ENDED', label: '판매 종료', color: 'gray' }, // blue: 종료
  COMPLETED: { code: 'COMPLETED', label: '판매 완료', color: 'teal' }, // teal: 완료
  STOPPED: { code: 'STOPPED', label: '판매 중지', color: 'red' }, // red: 중지
  PAUSED: { code: 'PAUSED', label: '판매 일시 정지', color: 'orange' }, // orange: 일시정지
}

export type OrderStatus = EnumItem & { color?: string }
export const OrderStatus: { [key: string]: OrderStatus } = {
  CREATED: { code: 'CREATED', label: '주문 생성', color: 'green' }, // orange: 진행중
  COMPLETED: { code: 'COMPLETED', label: '주문 완료', color: 'blue' }, // green: 완료
  CANCELLED: { code: 'CANCELLED', label: '주문 취소', color: 'red' }, // gray: 취소
  PARTIAL_CANCELLED: { code: 'PARTIAL_CANCELLED', label: '부분 취소', color: 'yellow' }, // yellow: 부분취소
}

export type PurchaseStatus = EnumItem & { color?: string }
export const PurchaseStatus: { [key: string]: PurchaseStatus } = {
  REQUESTED: { code: 'REQUESTED', label: '요청', color: 'green' }, // 요청: orange(진행중)
  APPROVED: { code: 'APPROVED', label: '승인', color: 'blue' }, // 승인: blue(승인)
  DELIVERY_STARTED: { code: 'DELIVERY_STARTED', label: '출고', color: 'sky' }, // 출고: teal(배송중)
  DELIVERED: { code: 'DELIVERED', label: '입고', color: 'indigo' }, // 입고: green(완료)
  REJECTED: { code: 'REJECTED', label: '거부', color: 'red' }, // 거부: red(실패)
  CANCELLED: { code: 'CANCELLED', label: '취소', color: 'red' }, // 취소: gray(중단)
}
