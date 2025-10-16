/**
 * 숫자 문자만 허용하는 입력 이벤트 핸들러
 * @param e - 입력 이벤트
 */
export function onlyNumberInput(e: Event) {
  const target = e.target as HTMLInputElement
  const numericValue = target.value.replace(/\D/g, '')
  target.value = numericValue
}

/**
 * 이메일에 유효한 문자만 허용하는 입력 이벤트 핸들러
 * @param e - 입력 이벤트
 */
export function onlyEmailInput(e: Event) {
  const target = e.target as HTMLInputElement
  // Allow: letters, numbers, @, ., -, _, +
  const emailValue = target.value.replace(/[^a-zA-Z0-9@._+-]/g, '')
  target.value = emailValue
}
