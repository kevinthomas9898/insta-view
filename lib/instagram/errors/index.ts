export type ErrorCode =
  | 'INVALID_USERNAME'
  | 'INVALID_URL'
  | 'PROFILE_NOT_FOUND'
  | 'PRIVATE_ACCOUNT'
  | 'PROFILE_OPTED_OUT'
  | 'EMPTY_CONTENT'
  | 'RATE_LIMITED'
  | 'PROVIDER_ERROR'
  | 'TIMEOUT'
  | 'UNSUPPORTED_FEATURE'
  | 'MEDIA_FETCH_FAILED'
  | 'SSRF_BLOCKED'
  | 'INTERNAL_ERROR';

export class InstagramError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode: number = 400, details?: unknown) {
    super(message);
    this.name = 'InstagramError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, InstagramError.prototype);
  }
}
