/**
 * Custom error class for application-specific errors.
 * Extends the built-in Error class with additional properties.
 */
export class AppError extends Error {
  /**
   * HTTP status code associated with the error.
   */
  statusCode: number;

  /**
   * Optional object containing detailed error information.
   */
  errors?: { [key: string]: string };

  /**
   * Creates an instance of AppError.
   * @param message - The error message.
   * @param statusCode - The HTTP status code associated with the error.
   * @param errors - Optional object containing detailed error information.
   */
  constructor(
    message: string,
    statusCode: number,
    errors?: { [key: string]: string }
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error class for resource not found errors.
 * Extends the AppError class with a default status code of 404.
 */
export class NotFoundError extends AppError {
  /**
   * Creates an instance of NotFoundError.
   * @param message - The error message (default: 'Resource not found').
   */
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Custom error class for validation errors.
 * Extends the AppError class with a default status code of 400.
 */
export class ValidationError extends AppError {
  /**
   * Creates an instance of ValidationError.
   * @param errors - Object containing validation error details.
   */
  constructor(errors: { [key: string]: string }) {
    super("Validation Error", 400, errors);
  }
}
