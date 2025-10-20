// 사용자 역할
export enum UserType {
  CONSUMER = 'consumer',
  BRANCH = 'branch',
  HQ = 'hq',
}

// 사용자 기본 정보
export interface ProfileData {
  id: string
  name: string
  email: string
  phone?: string
  profile_image?: string
  created_at?: string
  updated_at?: string
}
