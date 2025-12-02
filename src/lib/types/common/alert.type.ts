export type AlertType = 'info' | 'error' | 'warning' | 'success'
export type AlertMode = 'alert' | 'confirm'

export type AlertConfig = {
  type: AlertType
  mode: AlertMode
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export type AlertOptions = Partial<AlertConfig> & {
  title?: string
  message: string
}

export type ShowAlertOptions = Partial<AlertConfig> & {
  title?: string
  message: string
  onConfirm?: () => void
}

export type ShowConfirmOptions = Partial<AlertConfig> & {
  type?: AlertType
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}
