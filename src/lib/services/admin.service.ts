import * as adminRepository from '$lib/database/repositories/admin.repository'

/**
 * 사용자 삭제 (cleanup용)
 */

export const deleteUser = async (userId: string) => {
  return await adminRepository.deleteUser(userId)
}
