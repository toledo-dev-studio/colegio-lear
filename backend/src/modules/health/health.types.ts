/** Response shape for the health check endpoint */
export interface HealthResponse {
  status: string;
  name: string;
  version: string;
  description: string;
  uptime: number;
  timestamp: string;
}
