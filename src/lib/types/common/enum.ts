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

export const lookupEnum = <T extends EnumItem>(enumObj: { [key: string]: T }, code: string): T | undefined => {
  return Object.values(enumObj).find((item) => item.code === code)
}

export const equalsEnum = (a?: EnumItem | null, b?: EnumItem | null): boolean => {
  if (!a || !b) return false
  return a.code === b.code
}
