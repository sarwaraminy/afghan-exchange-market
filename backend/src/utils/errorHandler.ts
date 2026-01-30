import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Standard error response utility
 * Ensures all API errors follow the same format
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Send standardized error response
 * @param res Express response object
 * @param statusCode HTTP status code
 * @param error Error message
 * @param details Optional additional error details
 */
export function sendError(
  res: Response,
  statusCode: number,
  error: string,
  details?: any
): void {
  const response: ApiResponse = {
    success: false,
    error
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.message = details;
  }

  res.status(statusCode).json(response);
}

/**
 * Send standardized success response
 * @param res Express response object
 * @param data Response data
 * @param message Optional success message
 * @param statusCode HTTP status code (default 200)
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  // 400 Bad Request
  BAD_REQUEST: (res: Response, message: string = 'Bad request', details?: any) =>
    sendError(res, 400, message, details),

  VALIDATION_FAILED: (res: Response, details?: any) =>
    sendError(res, 400, 'Validation failed', details),

  MISSING_REQUIRED_FIELDS: (res: Response, fields: string[]) =>
    sendError(res, 400, `Missing required fields: ${fields.join(', ')}`),

  INVALID_INPUT: (res: Response, field: string, reason?: string) =>
    sendError(res, 400, `Invalid ${field}${reason ? ': ' + reason : ''}`),

  INSUFFICIENT_BALANCE: (res: Response, required: number, available: number) =>
    sendError(res, 400, `Insufficient balance. Required: ${required}, Available: ${available}`),

  // 401 Unauthorized
  UNAUTHORIZED: (res: Response, message: string = 'Unauthorized') =>
    sendError(res, 401, message),

  INVALID_CREDENTIALS: (res: Response) =>
    sendError(res, 401, 'Invalid credentials'),

  TOKEN_REQUIRED: (res: Response) =>
    sendError(res, 401, 'Access token required'),

  TOKEN_INVALID: (res: Response) =>
    sendError(res, 401, 'Invalid or expired token'),

  // 403 Forbidden
  FORBIDDEN: (res: Response, message: string = 'Access denied') =>
    sendError(res, 403, message),

  ADMIN_REQUIRED: (res: Response) =>
    sendError(res, 403, 'Admin access required'),

  // 404 Not Found
  NOT_FOUND: (res: Response, resource: string) =>
    sendError(res, 404, `${resource} not found`),

  // 409 Conflict
  CONFLICT: (res: Response, message: string) =>
    sendError(res, 409, message),

  ALREADY_EXISTS: (res: Response, resource: string) =>
    sendError(res, 409, `${resource} already exists`),

  // 500 Internal Server Error
  INTERNAL_ERROR: (res: Response, error?: any) =>
    sendError(
      res,
      500,
      'Internal server error',
      process.env.NODE_ENV === 'development' ? error?.message || error : undefined
    ),

  DATABASE_ERROR: (res: Response, operation: string) =>
    sendError(res, 500, `Database error during ${operation}`),
};
