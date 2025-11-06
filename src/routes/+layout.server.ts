export async function load({ cookies, locals: { safeGetSession } }) {
  /**
   * TODO: warning 발생 원인 해결 필요, safeGetSession 에서 getSession 호출로 인해 발생
   * Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server
   */
  const { user } = await safeGetSession()

  return {
    session: null,
    user,
    cookies: cookies.getAll(),
  }
}
