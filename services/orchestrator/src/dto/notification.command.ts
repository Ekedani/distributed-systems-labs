export class SendNotificationPayload {
  id: string;
  title: string;
  message: string;
  recipient: string;
  sentAt: number;
}

export class SendNotificationCommandDto {
  type = 'SendNotification';
  constructor(readonly payload: SendNotificationPayload) {}
}
