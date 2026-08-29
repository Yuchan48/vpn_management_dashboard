export interface AppError {
  status: number;
  error: string;
  message?: string;
}

export interface SqliteError extends Error {
  code?: string;
}
