/**
 * 애플리케이션 기본 에러 클래스
 */
export abstract class AppError extends Error {
  public abstract status: number
  public code?: string
  public details?: Record<string, any>

  constructor(message: string, options?: { code?: string; details?: Record<string, any> }) {
    super(message)
    this.name = this.constructor.name
    Object.setPrototypeOf(this, new.target.prototype)
    this.code = options?.code
    this.details = options?.details
  }
}

// ==============================
// 인증/인가 에러
// ==============================

/**
 * 회원가입 에러
 */
export class SignUpError extends AppError {
  public status = 400

  constructor(message: string, options?: { status?: number; code?: string; details?: Record<string, string> }) {
    super(message, options)
    this.status = options?.status ?? 400
  }
}

/**
 * 로그인 에러
 */
export class SignInError extends AppError {
  public status = 401

  constructor(message: string, options?: { status?: number; code?: string; details?: Record<string, string> }) {
    super(message, options)
    this.status = options?.status ?? 401
  }
}

/**
 * 권한 에러
 */
export class AuthorizationError extends AppError {
  public status = 403

  constructor(message: string = '권한이 없습니다', options?: { code?: string; details?: Record<string, any> }) {
    super(message, options)
  }
}

// ==============================
// 데이터 관련 에러
// ==============================

/**
 * 리소스를 찾을 수 없음
 */
export class NotFoundError extends AppError {
  public status = 404

  constructor(
    message: string = '요청한 리소스를 찾을 수 없습니다',
    options?: { code?: string; details?: Record<string, any> }
  ) {
    super(message, options)
  }
}

/**
 * 데이터 충돌
 */
export class ConflictError extends AppError {
  public status = 409

  constructor(message: string = '충돌이 발생했습니다', options?: { code?: string; details?: Record<string, any> }) {
    super(message, options)
  }
}

// ==============================
// 비즈니스 로직 에러
// ==============================

/**
 * 일반 비즈니스 로직 에러
 */
export class BusinessLogicError extends AppError {
  public status = 422

  constructor(message: string, options?: { code?: string; details?: Record<string, any> }) {
    super(message, options)
  }
}

/**
 * 공동구매 주문 가능 수량 초과 에러
 */
export class QuantityExceededError extends BusinessLogicError {
  constructor(
    requestedQuantity: number,
    availableQuantity: number,
    coopId?: string,
    coopName?: string,
    options?: { code?: string; details?: Record<string, any> }
  ) {
    let message = `주문 가능 수량을 초과했습니다.<br />요청: ${requestedQuantity}, 가능: ${availableQuantity}`

    if (coopName) {
      message = `${coopName}의 주문 가능 수량을 초과했습니다.<br />요청: ${requestedQuantity}, 가능: ${availableQuantity}`
    } else if (coopId) {
      message = `상품 ID: ${coopId}의 주문 가능 수량을 초과했습니다.<br />요청: ${requestedQuantity}, 가능: ${availableQuantity}`
    }

    super(message, {
      code: 'QUANTITY_EXCEEDED',
      details: {
        requestedQuantity,
        availableQuantity,
        coopId,
        coopName,
        ...options?.details,
      },
      ...options,
    })
  }
}

/**
 * 승인 처리 에러
 */
export class ApprovalError extends BusinessLogicError {
  constructor(
    message: string = '승인 처리 중 오류가 발생했습니다',
    options?: { code?: string; details?: Record<string, any> }
  ) {
    super(message, options)
  }
}

/**
 * 잘못된 상태 전환 에러 (발주, 주문 등의 상태 변경)
 */
export class InvalidStatusTransitionError extends BusinessLogicError {
  constructor(message: string = '잘못된 상태 전환입니다', options?: { code?: string; details?: Record<string, any> }) {
    super(message, options)
  }
}

// ==============================
// 유틸리티 함수
// ==============================

/**
 * AppError 인스턴스 체크
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * 에러 응답 생성
 */
export function createErrorResponse(error: unknown) {
  if (isAppError(error)) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        status: error.status,
        details: error.details,
      },
    }
  }

  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      code: 'UNKNOWN_ERROR',
      status: 500,
    },
  }
}
