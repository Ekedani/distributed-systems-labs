export class NotificationSentEvent {
  eventType = 'NotificationSent';
  constructor(
    public readonly payload: {
      id: string;
      title: string;
      message: string;
      recipient: string;
      sentAt: number;
    },
  ) {}
}
