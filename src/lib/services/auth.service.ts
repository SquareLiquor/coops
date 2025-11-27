import * as authRepository from '$lib/database/repositories/auth.repository'

/**
 * 로그아웃
 */
export const signout = async () => {
  return await authRepository.signout()
}

/**
 * 승인 요청 목록 조회 (필터링 + 페이지네이션)
 */
export const getApprovalRequests = async (filters: {
  status?: string
  storeId?: string
  dateFrom?: string
  dateTo?: string
  page: number
  pageSize: number
}) => {
  return await authRepository.getApprovalRequests(filters)
}

/**
 * 승인 요청 승인
 */
export const approveRequest = async (id: string, userId: string) => {
  return await authRepository.approveRequest(id, userId)
}

/**
 * 승인 요청 거부
 */
export const rejectRequest = async (id: string, userId: string) => {
  return await authRepository.rejectRequest(id, userId)
}

/**
 * 사용자 프로필 생성
 */
export const createUserProfile = async (
  userId: string,
  profileData: {
    name: string
    email: string
    phone1?: string
    phone2?: string
    phone3?: string
  }
) => {
  const { name, email, phone1, phone2, phone3 } = profileData

  let payload = {
    id: userId,
    name,
    email,
    phone: '',
  }

  // 전화번호가 모두 존재하고 숫자 형식일 때만 phone 추가
  if (phone1 && /^[0-9]+$/.test(phone1) && phone2 && /^[0-9]+$/.test(phone2) && phone3 && /^[0-9]+$/.test(phone3)) {
    payload.phone = `${phone1}-${phone2}-${phone3}`
  }

  return await authRepository.createProfile(userId, payload)
}

/**
 * 사용자 메타데이터 업데이트 (권한 부여)
 */
export const updateUserMetadata = async (userId: string, storeType?: string) => {
  return await authRepository.updateUserMetadata(userId, storeType)
}

/**
 * 가입 승인 요청 생성
 */
export const createSignupApprovalRequest = async (userId: string, storeId?: string) => {
  const payload = {
    applicant_id: userId,
    store_id: storeId,
    status: storeId ? 'pending' : 'approved',
    requested_at: new Date().toISOString(),
  }

  return await authRepository.insertApprovalRequest(payload)
}
