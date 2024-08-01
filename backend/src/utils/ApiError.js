/**
 * @class ApiError
 * @extends {Error}
 * @description Custom error class
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.success = false;
    this.statusCode = statusCode;
    this.data = null;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
