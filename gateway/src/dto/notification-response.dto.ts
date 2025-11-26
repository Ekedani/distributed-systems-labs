export class NotificationResponseDto {
  success: boolean;
  notificationId: string;
  processedAt?: number;
  processingTimeMs: number;
  gatewayTotalTimeMs?: number;
  dispatcherProcessingTimeMs?: number;
}
