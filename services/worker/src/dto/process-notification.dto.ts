export class NotificationCommandDto {
  type: 'SendNotification';
  payload: SendNotifcationPayload;
}

export class SendNotifcationPayload {
  id: string;
  title: string;
  message: string;
  recipient: string;
  sentAt: number;
}
