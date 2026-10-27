export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      404,
      "NOT_FOUND"
    );
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422, "VALIDATION_ERROR");
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class InsufficientFundsError extends AppError {
  constructor() {
    super("Insufficient balance to complete this transaction", 422, "INSUFFICIENT_FUNDS");
    this.name = "InsufficientFundsError";
    Object.setPrototypeOf(this, InsufficientFundsError.prototype);
  }
}
