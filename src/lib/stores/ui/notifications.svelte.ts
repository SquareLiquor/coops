// src/stores/notifications.ts

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  timeout?: number // 자동 사라짐 시간(ms)
}

const notifications = $state<Notification[]>([])

const addNotification = (notification: Pick<Notification, 'type' | 'message' | 'timeout'>) => {
  const id = crypto.randomUUID()
  notifications.push({ id, ...notification })

  if (notification.timeout) {
    setTimeout(() => removeNotification(id), notification.timeout)
  }
}

const removeNotification = (id: string) => {
  const index = notifications.findIndex((n) => n.id === id)

  if (index !== -1) {
    notifications.splice(index, 1) // ✅ 반응형으로 동작
  }
}

export { addNotification, notifications, removeNotification }
