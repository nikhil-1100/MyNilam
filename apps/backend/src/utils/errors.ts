/**
 * Custom Error Classes
 * 
 * These extend the built-in Error class with HTTP status codes and
 * structured error details. The global error handler checks instanceof
 * to decide how to format the response.
 */

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code: string

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    isOperational = true,
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}

// 400
export class ValidationError extends AppError {
  public readonly errors?: Record<string, string[]>

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR')
    this.errors = errors
  }
}

// 401
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

// 403
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN')
  }
}

// 404
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

// 409
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

// 410
export class GoneError extends AppError {
  constructor(message = 'This resource is no longer available') {
    super(message, 410, 'GONE')
  }
}

// 413
export class FileTooLargeError extends AppError {
  constructor(maxSizeMB: number) {
    super(`File size exceeds the maximum allowed size of ${maxSizeMB}MB`, 413, 'FILE_TOO_LARGE')
  }
}

// 415
export class UnsupportedMediaError extends AppError {
  constructor(message = 'Unsupported file type') {
    super(message, 415, 'UNSUPPORTED_MEDIA')
  }
}

// 422
export class UnprocessableError extends AppError {
  constructor(message: string) {
    super(message, 422, 'UNPROCESSABLE')
  }
}

// 429
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}
