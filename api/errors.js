export class AppError extends Error {
  constructor(message, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") { super(message, 422, "VALIDATION_ERROR"); }
}
export class ConflictError extends AppError {
  constructor(message = "Conflict") { super(message, 409, "CONFLICT"); }
}
export class NotFoundError extends AppError {
  constructor(message = "Not found") { super(message, 404, "NOT_FOUND"); }
}
export class InternalError extends AppError {
  constructor(message = "Internal error") { super(message, 500, "INTERNAL_ERROR"); }
}
