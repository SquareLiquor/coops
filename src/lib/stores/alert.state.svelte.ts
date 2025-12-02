import type { AlertConfig, AlertOptions, AlertType, ShowAlertOptions, ShowConfirmOptions } from '$lib/types'

let alertState = $state<AlertConfig | null>(null)

const getAlert = () => alertState

const isAlertVisible = () => alertState !== null

/**
 * 성공 Alert
 * @example
 * showSuccess({ message: '저장되었습니다' })
 * showSuccess({ message: '저장되었습니다', title: '완료' })
 * showSuccess({ message: '저장되었습니다', onConfirm: () => goto('/list') })
 */
const showSuccess = (options: ShowAlertOptions) => {
  _showAlert({
    type: 'success',
    title: options.title || '성공',
    message: options.message,
    onConfirm: options.onConfirm,
  })
}

/**
 * 에러 Alert
 * @example
 * showError({ message: '오류가 발생했습니다' })
 * showError({ message: '오류가 발생했습니다', title: '실패' })
 * showError({ message: '오류가 발생했습니다', onConfirm: () => console.log('확인') })
 */
const showError = (options: ShowAlertOptions) => {
  _showAlert({
    type: 'error',
    title: options.title || '오류',
    message: options.message,
    onConfirm: options.onConfirm,
  })
}

/**
 * 경고 Alert
 * @example
 * showWarning({ message: '주의가 필요합니다' })
 * showWarning({ message: '주의가 필요합니다', title: '주의' })
 */
const showWarning = (options: ShowAlertOptions) => {
  _showAlert({
    type: 'warning',
    title: options.title || '경고',
    message: options.message,
    onConfirm: options.onConfirm,
  })
}

/**
 * 정보 Alert
 * @example
 * showInfo({ message: '알림 내용입니다' })
 * showInfo({ message: '알림 내용입니다', title: '안내' })
 */
const showInfo = (options: ShowAlertOptions) => {
  _showAlert({
    type: 'info',
    title: options.title || '알림',
    message: options.message,
    onConfirm: options.onConfirm,
  })
}

/**
 * 확인 Alert (Confirm 모드)
 * @example
 * showConfirm({
 *   message: '정말 삭제하시겠습니까?',
 *   onConfirm: () => deleteItem(),
 *   onCancel: () => console.log('취소')
 * })
 * showConfirm({
 *   message: '진행하시겠습니까?',
 *   title: '확인',
 *   type: 'info',
 *   confirmText: '진행',
 *   cancelText: '취소',
 *   onConfirm: () => proceed()
 * })
 */
const showConfirm = (options: ShowConfirmOptions) => {
  _showAlert({
    ...options,
    mode: 'confirm',
    type: options.type || 'warning',
    title: options.title || '확인',
  })
}

/**
 * Alert 닫기
 */
const closeAlert = () => {
  alertState = null
}

/**
 * 타입별 기본 제목 반환
 */
const _getDefaultTitle = (type: AlertType): string => {
  const titles: Record<AlertType, string> = {
    success: '성공',
    error: '오류',
    warning: '경고',
    info: '알림',
  }
  return titles[type]
}

/**
 * Alert 표시
 */
const _showAlert = (options: AlertOptions) => {
  alertState = {
    type: options.type || 'info',
    mode: options.mode || 'alert',
    title: options.title || _getDefaultTitle(options.type || 'info'),
    message: options.message,
    confirmText: options.confirmText || '확인',
    cancelText: options.cancelText || '취소',
    onConfirm: options.onConfirm,
    onCancel: options.onCancel,
  }
}

export { closeAlert, getAlert, isAlertVisible, showConfirm, showError, showInfo, showSuccess, showWarning }
