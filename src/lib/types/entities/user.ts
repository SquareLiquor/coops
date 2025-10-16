// 사용자 역할
export enum UserType {
  CONSUMER = 'consumer',
  BRANCH = 'branch',
  HQ = 'hq',
}

// 사용자 기본 정보
export interface UserProfile {
  id: string
  email: string
  name?: string
  phone?: string
  avatar_url?: string
  role: UserType
  store_id?: string
  created_at?: string
  updated_at?: string
}
