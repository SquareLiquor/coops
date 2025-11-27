// Base error class for the application
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

  errorHandler() {
    const { status, details } = this
    console.error(this.message)
  }
}

// Authentication related errors
export class SignUpError extends AppError {
  public status = 400

  constructor(message: string, options?: { status?: number; code?: string; details?: Record<string, string> }) {
    super(message, options)
    this.status = options?.status ?? 400
  }
}

export class SignInError extends AppError {
  public status = 401

  constructor(message: string, options?: { status?: number; code?: string; details?: Record<string, string> }) {
    super(message, options)
    this.status = options?.status ?? 401
  }
}

export class AuthorizationError extends AppError {
  public status = 403

  constructor(message: string = '권한이 없습니다', options?: { code?: string; details?: Record<string, any> }) {
    super(message, options)
  }
}

// Validation related errors
export class ValidationError extends AppError {
  public status = 400

  constructor(
    message: string = '입력값이 올바르지 않습니다',
    options?: { code?: string; details?: Record<string, string> }
  ) {
    super(message, options)
  }
}

export class FormValidationError extends ValidationError {
  constructor(fieldErrors: Record<string, string>) {
    super('폼 검증에 실패했습니다', {
      code: 'FORM_VALIDATION_ERROR',
      details: fieldErrors,
    })
  }
}

// Database related errors
export class DatabaseError extends AppError {
  public status = 500

  constructor(
    message: string = '데이터베이스 오류가 발생했습니다',
    options?: { code?: string; details?: Record<string, any> }
  ) {
    super(message, options)
  }
}

export class NotFoundError extends AppError {
  public status = 404

  constructor(
    message: string = '요청한 리소스를 찾을 수 없습니다',
    options?: { code?: string; details?: Record<string, any> }
  ) {
    super(message, options)
  }
}

export class ConflictError extends AppError {
  public status = 409

  constructor(message: string = '충돌이 발생했습니다', options?: { code?: string; details?: Record<string, any> }) {
    super(message, options)
  }
}

// Business logic errors
export class BusinessLogicError extends AppError {
  public status = 422

  constructor(message: string, options?: { code?: string; details?: Record<string, any> }) {
    super(message, options)
  }
}

export class RegistrationError extends BusinessLogicError {
  constructor(
    message: string = '회원가입 처리 중 오류가 발생했습니다',
    options?: { code?: string; details?: Record<string, any> }
  ) {
    super(message, options)
  }
}

export class ApprovalError extends BusinessLogicError {
  constructor(
    message: string = '승인 처리 중 오류가 발생했습니다',
    options?: { code?: string; details?: Record<string, any> }
  ) {
    super(message, options)
  }
}

export class InvalidStatusTransitionError extends BusinessLogicError {
  constructor(message: string = '잘못된 상태 전환입니다', options?: { code?: string; details?: Record<string, any> }) {
    super(message, options)
  }
}

// External service errors
export class ExternalServiceError extends AppError {
  public status = 502

  constructor(
    message: string = '외부 서비스 오류가 발생했습니다',
    options?: { code?: string; details?: Record<string, any> }
  ) {
    super(message, options)
  }
}

export class SupabaseError extends ExternalServiceError {
  constructor(message: string, options?: { code?: string; details?: Record<string, any> }) {
    super(`Supabase 오류: ${message}`, options)
  }
}

// Network related errors
export class NetworkError extends AppError {
  public status = 503

  constructor(
    message: string = '네트워크 오류가 발생했습니다',
    options?: { code?: string; details?: Record<string, any> }
  ) {
    super(message, options)
  }
}

// Rate limiting errors
export class RateLimitError extends AppError {
  public status = 429

  constructor(
    message: string = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요',
    options?: { code?: string; details?: Record<string, any> }
  ) {
    super(message, options)
  }
}

// Configuration errors
export class ConfigurationError extends AppError {
  public status = 500

  constructor(
    message: string = '설정 오류가 발생했습니다',
    options?: { code?: string; details?: Record<string, any> }
  ) {
    super(message, options)
  }
}

// Helper function to determine if an error is an AppError
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

// Helper function to create error response
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

  // Handle unknown errors
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      code: 'UNKNOWN_ERROR',
      status: 500,
    },
  }
}

// Error codes enum for better type safety
export enum ErrorCodes {
  // Auth
  SIGNUP_FAILED = 'SIGNUP_FAILED',
  SIGNIN_FAILED = 'SIGNIN_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FORM_VALIDATION_ERROR = 'FORM_VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Business Logic
  REGISTRATION_PENDING = 'REGISTRATION_PENDING',
  REGISTRATION_REJECTED = 'REGISTRATION_REJECTED',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',

  // External Services
  SUPABASE_ERROR = 'SUPABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Configuration
  CONFIG_ERROR = 'CONFIG_ERROR',
  MISSING_ENV_VAR = 'MISSING_ENV_VAR',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
