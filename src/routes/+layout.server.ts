export async function load({ locals: { safeGetSession }, cookies }) {
  // 서버에서 현재 로그인한 사용자 확인
  const { session, user } = await safeGetSession()

  return {
    session,
    user,
    cookies: cookies.getAll(),
  }
}
