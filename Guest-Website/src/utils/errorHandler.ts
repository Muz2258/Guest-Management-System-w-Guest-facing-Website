/**
 * Unified Error Handling System
 * Provides standardized error types, logging, and user-friendly messages
 */

// Error Types
export const ErrorType = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  STORAGE: 'STORAGE',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN'
} as const

export type ErrorType = typeof ErrorType[keyof typeof ErrorType]

// Error Severity Levels
export const ErrorSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const

export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity]

// Standardized Error Interface
export interface AppError {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  userMessage: string
  code?: string
  details?: Record<string, any>
  timestamp: Date
  context?: string
}

// Error Messages Map
const ERROR_MESSAGES: Record<ErrorType, { default: string; user: string }> = {
  [ErrorType.NETWORK]: {
    default: 'Network request failed',
    user: 'Unable to connect. Please check your internet connection and try again.'
  },
  [ErrorType.VALIDATION]: {
    default: 'Validation failed',
    user: 'Please check your input and try again.'
  },
  [ErrorType.STORAGE]: {
    default: 'Storage operation failed',
    user: 'Unable to save your data. Please try again.'
  },
  [ErrorType.AUTHENTICATION]: {
    default: 'Authentication failed',
    user: 'Your session has expired. Please refresh the page.'
  },
  [ErrorType.AUTHORIZATION]: {
    default: 'Authorization failed',
    user: 'You don\'t have permission to perform this action.'
  },
  [ErrorType.NOT_FOUND]: {
    default: 'Resource not found',
    user: 'The requested information could not be found.'
  },
  [ErrorType.SERVER]: {
    default: 'Server error occurred',
    user: 'Something went wrong on our end. Please try again later.'
  },
  [ErrorType.UNKNOWN]: {
    default: 'Unknown error occurred',
    user: 'An unexpected error occurred. Please try again.'
  }
}

// Error Creation Helper
export function createError(
  type: ErrorType,
  message?: string,
  options: {
    severity?: ErrorSeverity
    userMessage?: string
    code?: string
    details?: Record<string, any>
    context?: string
  } = {}
): AppError {
  const errorConfig = ERROR_MESSAGES[type]
  
  return {
    type,
    severity: options.severity || ErrorSeverity.MEDIUM,
    message: message || errorConfig.default,
    userMessage: options.userMessage || errorConfig.user,
    code: options.code,
    details: options.details,
    timestamp: new Date(),
    context: options.context
  }
}

// Error from unknown source
export function createErrorFromUnknown(
  error: unknown,
  context?: string,
  type: ErrorType = ErrorType.UNKNOWN
): AppError {
  if (error instanceof Error) {
    return createError(type, error.message, { context })
  }
  
  if (typeof error === 'string') {
    return createError(type, error, { context })
  }
  
  return createError(type, 'An unknown error occurred', { 
    context,
    details: { originalError: error }
  })
}

// Logging Utilities
class Logger {
  private formatLogMessage(error: AppError): string {
    const timestamp = error.timestamp.toISOString()
    const context = error.context ? ` [${error.context}]` : ''
    return `[${timestamp}] ${error.severity}${context}: ${error.message}`
  }

  private getConsoleMethod(severity: ErrorSeverity) {
    switch (severity) {
      case ErrorSeverity.LOW:
        return console.info
      case ErrorSeverity.MEDIUM:
        return console.warn
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return console.error
      default:
        return console.log
    }
  }

  log(error: AppError): void {
    const consoleMethod = this.getConsoleMethod(error.severity)
    const message = this.formatLogMessage(error)
    
    consoleMethod('🚨', message)
    
    if (error.details) {
      console.group('Error Details:')
      console.table(error.details)
      console.groupEnd()
    }
  }

  logCatch(error: unknown, context?: string, type?: ErrorType): AppError {
    const appError = createErrorFromUnknown(error, context, type)
    this.log(appError)
    return appError
  }
}

export const logger = new Logger()

// Error Handling Wrapper for Async Functions
export async function handleAsync<T>(
  operation: () => Promise<T>,
  context?: string,
  errorType?: ErrorType
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    const appError = logger.logCatch(error, context, errorType)
    return { success: false, error: appError }
  }
}

// Error Handling Wrapper for Sync Functions
export function handleSync<T>(
  operation: () => T,
  context?: string,
  errorType?: ErrorType
): { success: true; data: T } | { success: false; error: AppError } {
  try {
    const data = operation()
    return { success: true, data }
  } catch (error) {
    const appError = logger.logCatch(error, context, errorType)
    return { success: false, error: appError }
  }
}

// Validation Helpers
export function validateRequired(value: any, fieldName: string): AppError | null {
  if (value === null || value === undefined || value === '') {
    return createError(ErrorType.VALIDATION, `${fieldName} is required`, {
      userMessage: `Please provide a ${fieldName.toLowerCase()}.`,
      code: 'REQUIRED_FIELD',
      details: { field: fieldName }
    })
  }
  return null
}

export function validateLength(
  value: string, 
  min: number, 
  max: number, 
  fieldName: string
): AppError | null {
  if (value.length < min) {
    return createError(ErrorType.VALIDATION, `${fieldName} too short`, {
      userMessage: `${fieldName} must be at least ${min} characters.`,
      code: 'MIN_LENGTH',
      details: { field: fieldName, min, actual: value.length }
    })
  }
  
  if (value.length > max) {
    return createError(ErrorType.VALIDATION, `${fieldName} too long`, {
      userMessage: `${fieldName} must be ${max} characters or less.`,
      code: 'MAX_LENGTH',
      details: { field: fieldName, max, actual: value.length }
    })
  }
  
  return null
}

// Store Error State Helper
export interface ErrorState {
  error: AppError | null
  hasError: boolean
  isLoading: boolean
}

export function createErrorState(): ErrorState {
  return {
    error: null,
    hasError: false,
    isLoading: false
  }
}

export function setError(state: ErrorState, error: AppError | unknown, context?: string): void {
  state.error = error instanceof Error || typeof error === 'object' && error !== null && 'type' in error 
    ? error as AppError 
    : createErrorFromUnknown(error, context)
  state.hasError = true
  state.isLoading = false
  logger.log(state.error)
}

export function clearError(state: ErrorState): void {
  state.error = null
  state.hasError = false
}

export function setLoading(state: ErrorState, loading: boolean): void {
  state.isLoading = loading
  if (loading) {
    clearError(state)
  }
}