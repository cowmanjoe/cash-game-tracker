export type ServerResponse<T> = SuccessServerResponse<T> | ErrorServerResponse;

export interface SuccessServerResponse<T> {
  data: T
  isError: false;
}

export interface ErrorServerResponse {
  error: ErrorInfo;
  isError: true;
}

export interface ErrorInfo {
  type: string;
  message?: string;
}