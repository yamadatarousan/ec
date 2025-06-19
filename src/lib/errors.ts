/**
 * アプリケーション統一エラーハンドリングシステム
 */

export enum ErrorCode {
  // 認証関連
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // バリデーション関連
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // リソース関連
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',

  // ビジネスロジック関連
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  ORDER_NOT_CANCELLABLE = 'ORDER_NOT_CANCELLABLE',

  // システム関連
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly details?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    code: ErrorCode,
    message: string,
    userMessage: string,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.userMessage = userMessage;
    this.details = details;
    this.timestamp = new Date();

    // スタックトレースの調整
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * よく使用されるエラーのファクトリ関数
 */
export class ErrorFactory {
  static unauthorized(
    message: string = '認証が必要です',
    details?: Record<string, any>
  ): AppError {
    return new AppError(
      ErrorCode.UNAUTHORIZED,
      'Unauthorized access',
      message,
      401,
      details
    );
  }

  static forbidden(
    message: string = 'アクセス権限がありません',
    details?: Record<string, any>
  ): AppError {
    return new AppError(
      ErrorCode.FORBIDDEN,
      'Forbidden access',
      message,
      403,
      details
    );
  }

  static notFound(
    resource: string,
    id?: string,
    details?: Record<string, any>
  ): AppError {
    const userMessage = id
      ? `${resource}（ID: ${id}）が見つかりません`
      : `${resource}が見つかりません`;

    return new AppError(
      ErrorCode.NOT_FOUND,
      `${resource} not found`,
      userMessage,
      404,
      { resource, id, ...details }
    );
  }

  static alreadyExists(
    resource: string,
    field: string,
    value: string,
    details?: Record<string, any>
  ): AppError {
    return new AppError(
      ErrorCode.ALREADY_EXISTS,
      `${resource} already exists`,
      `この${field}は既に使用されています`,
      409,
      { resource, field, value, ...details }
    );
  }

  static validationError(
    message: string,
    field?: string,
    details?: Record<string, any>
  ): AppError {
    return new AppError(
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      message,
      400,
      { field, ...details }
    );
  }

  static insufficientStock(
    productId: string,
    requested: number,
    available: number
  ): AppError {
    return new AppError(
      ErrorCode.INSUFFICIENT_STOCK,
      'Insufficient stock',
      `在庫が不足しています（要求: ${requested}, 利用可能: ${available}）`,
      400,
      { productId, requested, available }
    );
  }

  static orderNotCancellable(orderId: string, status: string): AppError {
    return new AppError(
      ErrorCode.ORDER_NOT_CANCELLABLE,
      'Order cannot be cancelled',
      `この注文はキャンセルできません（現在の状態: ${status}）`,
      400,
      { orderId, status }
    );
  }

  static databaseError(operation: string, originalError?: Error): AppError {
    return new AppError(
      ErrorCode.DATABASE_ERROR,
      `Database error during ${operation}`,
      'データベースエラーが発生しました。しばらく時間をおいて再度お試しください。',
      500,
      {
        operation,
        originalMessage: originalError?.message,
        originalStack: originalError?.stack,
      }
    );
  }

  static networkError(url?: string, method?: string): AppError {
    return new AppError(
      ErrorCode.NETWORK_ERROR,
      'Network error',
      'ネットワークエラーが発生しました。接続状況をご確認ください。',
      503,
      { url, method }
    );
  }

  static internalServerError(
    message: string = 'Internal server error',
    originalError?: Error
  ): AppError {
    return new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      message,
      'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。',
      500,
      {
        originalMessage: originalError?.message,
        originalStack: originalError?.stack,
      }
    );
  }
}

/**
 * エラーログ出力ヘルパー
 */
export class ErrorLogger {
  static log(error: AppError | Error, context?: string): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : '';

    if (error instanceof AppError) {
      console.error(`${timestamp} ${contextStr}AppError:`, {
        code: error.code,
        message: error.message,
        userMessage: error.userMessage,
        statusCode: error.statusCode,
        details: error.details,
        stack: error.stack,
      });
    } else {
      console.error(`${timestamp} ${contextStr}Error:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
  }

  static logWithRequest(
    error: AppError | Error,
    request: {
      method?: string;
      url?: string;
      headers?: Record<string, string>;
      body?: any;
    }
  ): void {
    const timestamp = new Date().toISOString();

    console.error(`${timestamp} API Error:`, {
      request: {
        method: request.method,
        url: request.url,
        userAgent: request.headers?.['user-agent'],
        contentType: request.headers?.['content-type'],
      },
      error:
        error instanceof AppError
          ? error.toJSON()
          : {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
    });
  }
}

/**
 * エラー応答ヘルパー
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
  };
}

export function createErrorResponse(error: AppError | Error): {
  response: ErrorResponse;
  statusCode: number;
} {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    return {
      response: {
        error: {
          code: error.code,
          message: error.userMessage,
          details:
            process.env.NODE_ENV === 'development' ? error.details : undefined,
          timestamp,
        },
      },
      statusCode: error.statusCode,
    };
  }

  // 一般的なErrorの場合
  const statusCode = 500;
  const userMessage =
    process.env.NODE_ENV === 'development'
      ? error.message
      : 'サーバーエラーが発生しました';

  return {
    response: {
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: userMessage,
        details:
          process.env.NODE_ENV === 'development'
            ? {
                originalMessage: error.message,
                stack: error.stack,
              }
            : undefined,
        timestamp,
      },
    },
    statusCode,
  };
}

/**
 * エラーが特定の種類かどうかをチェックするヘルパー
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isAuthError(error: unknown): error is AppError {
  return (
    isAppError(error) &&
    [
      ErrorCode.UNAUTHORIZED,
      ErrorCode.FORBIDDEN,
      ErrorCode.TOKEN_EXPIRED,
      ErrorCode.INVALID_CREDENTIALS,
    ].includes(error.code)
  );
}

export function isValidationError(error: unknown): error is AppError {
  return (
    isAppError(error) &&
    [
      ErrorCode.VALIDATION_ERROR,
      ErrorCode.REQUIRED_FIELD_MISSING,
      ErrorCode.INVALID_FORMAT,
    ].includes(error.code)
  );
}

export function isNotFoundError(error: unknown): error is AppError {
  return isAppError(error) && error.code === ErrorCode.NOT_FOUND;
}
