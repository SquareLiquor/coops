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

export const lookupEnum = <T extends EnumItem>(enumObj: { [key: string]: T }, code: string): T | undefined => {
  return Object.values(enumObj).find((item) => item.code === code)
}

export const equalsEnum = (a?: EnumItem | null, b?: EnumItem | null): boolean => {
  if (!a || !b) return false
  return a.code === b.code
}
