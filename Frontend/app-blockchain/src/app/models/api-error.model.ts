export interface ApiErrorModel {
  status: number;
  message: string;
  timestamp: string;
  details?: unknown;
}
