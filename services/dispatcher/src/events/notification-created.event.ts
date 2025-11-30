export class NotificationCreatedEvent {
  eventType = 'NotificationCreated';
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
