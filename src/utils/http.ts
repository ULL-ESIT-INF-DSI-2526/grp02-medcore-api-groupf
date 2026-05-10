import type { Response } from 'express';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: Record<string, { message: string }>
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

type ErrorBody = {
  message: string;
  errors?: Record<string, { message: string }>;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidationError(error: unknown): boolean {
  return isObject(error) && error.name === 'ValidationError' && isObject(error.errors);
}

function isCastError(error: unknown): boolean {
  return isObject(error) && error.name === 'CastError';
}

function isDuplicateKeyError(error: unknown): boolean {
  return isObject(error) && error.code === 11000;
}

function formatValidationErrors(error: unknown): Record<string, { message: string }> {
  const formattedErrors: Record<string, { message: string }> = {};

  if (!isObject(error) || !isObject(error.errors)) {
    return formattedErrors;
  }

  for (const [path, issue] of Object.entries(error.errors)) {
    if (isObject(issue) && typeof issue.message === 'string') {
      formattedErrors[path] = { message: issue.message };
    }
  }

  return formattedErrors;
}

function getErrorResponse(error: unknown): { statusCode: number; body: ErrorBody } {
  if (error instanceof HttpError) {
    return {
      statusCode: error.statusCode,
      body: {
        message: error.message,
        ...(error.errors ? { errors: error.errors } : {})
      }
    };
  }

  if (error instanceof SyntaxError) {
    return {
      statusCode: 400,
      body: { message: 'Invalid JSON body' }
    };
  }

  if (isValidationError(error)) {
    return {
      statusCode: 400,
      body: {
        message: 'Validation failed',
        errors: formatValidationErrors(error)
      }
    };
  }

  if (isCastError(error)) {
    return {
      statusCode: 400,
      body: { message: 'Invalid identifier' }
    };
  }

  if (isDuplicateKeyError(error)) {
    return {
      statusCode: 409,
      body: { message: 'Duplicate resource' }
    };
  }

  return {
    statusCode: 500,
    body: { message: 'Internal server error' }
  };
}

export function sendErrorResponse(res: Response, error: unknown): Response {
  const payload = getErrorResponse(error);
  return res.status(payload.statusCode).json(payload.body);
}