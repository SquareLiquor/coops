// Form 관련 기본 타입 정의

// 제네릭 FormData 타입
export type FormData<T = string, K extends string = string> = { [key in K]: T }

// 구체적인 폼 데이터 타입들 (interface 사용)
export interface SignupFormData extends FormData {
  email: string
  name: string
  phone1: string
  phone2: string
  phone3: string
  password: string
  confirmPassword: string
  storeId: string
}

export interface SigninFormData extends FormData {
  email: string
  password: string
}

// 폼 검증 관련
export interface ValidationErrors {
  [field: string]: string
}
