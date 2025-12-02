export class GetNotificationResponseDto {
  id: string;
  title: string;
  message: string;
  recipient: string;
  sentAt: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
