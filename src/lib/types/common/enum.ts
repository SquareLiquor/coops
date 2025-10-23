type EnumItem = {
  code: string
  label: string
}

type UserTypeEnumItem = EnumItem

export const UserType: { [key: string]: UserTypeEnumItem } = {
  CONSUMER: { code: 'consumer', label: '소비자' },
  BRANCH: { code: 'branch', label: '지점' },
  HQ: { code: 'hq', label: '본사' },
}

export type UserType = UserTypeEnumItem

type ApprovalStatusEnumItem = EnumItem & {
  color?: string
}

export const ApprovalStatus: { [key: string]: ApprovalStatusEnumItem } = {
  PENDING: { code: 'pending', label: '승인 대기', color: 'yellow' },
  APPROVED: { code: 'approved', label: '승인 완료', color: 'green' },
  REJECTED: { code: 'rejected', label: '승인 거부', color: 'red' },
}

export type ApprovalStatus = ApprovalStatusEnumItem
