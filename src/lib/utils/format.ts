export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount)
}

export const formatNumberWithCommas = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount)
}

/**
 * 전화번호 포맷팅 (2~3-3~4-4 자릿수)
 * @param phone - 포맷팅할 전화번호 (숫자만 또는 하이픈 포함)
 * @returns 포맷팅된 전화번호 (예: 02-1234-5678, 010-1234-5678)
 */
export const formatPhoneNumber = (phone: string): string => {
  // 숫자만 추출
  const numbers = phone.replace(/[^\d]/g, '')
  
  if (numbers.length === 0) return ''
  
  // 02로 시작하는 서울 지역번호 (2-3-4 또는 2-4-4)
  if (numbers.startsWith('02')) {
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`
  }
  
  // 010, 011, 016, 017, 018, 019 등 휴대폰 또는 3자리 지역번호 (3-3-4 또는 3-4-4)
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}
