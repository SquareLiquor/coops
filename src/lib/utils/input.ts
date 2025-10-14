/**
 * Input event handler that only allows numeric characters
 * @param e - The input event
 */
export function onlyNumberInput(e: Event) {
  const target = e.target as HTMLInputElement
  const numericValue = target.value.replace(/\D/g, '')
  target.value = numericValue
}

/**
 * Input event handler that only allows email-valid characters
 * @param e - The input event
 */
export function onlyEmailInput(e: Event) {
  const target = e.target as HTMLInputElement
  // Allow: letters, numbers, @, ., -, _, +
  const emailValue = target.value.replace(/[^a-zA-Z0-9@._+-]/g, '')
  target.value = emailValue
}

/**
 * Removes all non-numeric characters from a string
 * @param value - The string to filter
 * @returns String containing only numeric characters
 */
export function filterNumericOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Formats a phone number string with dashes (XXX-XXXX-XXXX)
 * @param phone - The phone number string (numbers only)
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return cleaned
}
