export class SendNotificationCommand {
  readonly commandType = 'SendNotification';

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
