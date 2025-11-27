export const deleteUser = async (userId: string) => {
  const { supabaseAdmin } = await import('../clients/admin')
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) throw error
}
