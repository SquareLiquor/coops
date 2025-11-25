export interface ApproveRequestHookContext {
  storeId: string
  userId: string
  originStatus?: 'pending' | 'approved' | 'rejected'
}
