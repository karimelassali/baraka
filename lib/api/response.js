// lib/api/response.js
/**
 * Utility functions for API responses
 */

/**
 * Success response
 * @param {any} data - The data to return
 * @param {number} statusCode - The HTTP status code (default: 200)
 * @returns {Response} The response object
 */
export function successResponse(data, statusCode = 200) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Error response
 * @param {string} message - The error message
 * @param {number} statusCode - The HTTP status code (default: 500)
 * @param {Array} details - Optional details about the error
 * @returns {Response} The response object
 */
export function errorResponse(message, statusCode = 500, details = []) {
  return new Response(JSON.stringify({ 
    success: false, 
    error: message,
    ...(details.length > 0 && { details })
  }), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Validation error response
 * @param {Array} errors - Array of validation errors
 * @returns {Response} The response object
 */
export function validationErrorResponse(errors) {
  return errorResponse('Validation failed', 400, errors);
}