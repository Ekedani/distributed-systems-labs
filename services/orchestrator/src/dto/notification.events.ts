export class NotificationCreatedEvent {
  readonly eventType = 'NotificationCreated';

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

export class NotificationSentEvent {
  readonly eventType = 'NotificationSent';

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
