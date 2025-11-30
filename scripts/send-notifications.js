const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';

async function sendNotification(notification) {
  try {
    const response = await fetch(`${GATEWAY_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    const data = await response.json();
    console.log(
      `Sent: [${notification.priority.toUpperCase()}] ${notification.title} -> ${notification.recipient} (ID: ${data.notificationId})`,
    );
    return data;
  } catch (error) {
    console.error(
      `Failed: [${notification.priority.toUpperCase()}] ${notification.title} - ${error.message}`,
    );
    throw error;
  }
}

async function main() {
  const notifications = [];

  for (let i = 1; i <= 10; i++) {
    notifications.push({
      title: `Normal Priority Message ${i}`,
      message: `This is a normal priority notification #${i}`,
      recipient: `user${i}@example.com`,
      priority: 'normal',
      sentAt: Date.now(),
    });
  }

  for (let i = 1; i <= 5; i++) {
    notifications.push({
      title: `High Priority Alert ${i}`,
      message: `This is a high priority notification #${i} - URGENT!`,
      recipient: `admin${i}@example.com`,
      priority: 'high',
      sentAt: Date.now(),
    });
  }

  for (let i = 11; i <= 20; i++) {
    notifications.push({
      title: `Normal Priority Message ${i}`,
      message: `This is a normal priority notification #${i}`,
      recipient: `user${i}@example.com`,
      priority: 'normal',
      sentAt: Date.now(),
    });
  }

  console.log(`Sending ${notifications.length} notifications...`);
  console.log(`Breakdown: 10 normal + 5 high + 10 normal = 25 total`);
  console.log(`Gateway: ${GATEWAY_URL}`);

  const startTime = Date.now();

  for (let i = 0; i < notifications.length; i++) {
    try {
      sendNotification(notifications[i]);
      if ((i + 1) % 5 === 0) {
        console.log(`Progress: ${i + 1}/${notifications.length} sent`);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error sending notification ${i + 1}:`, error.message);
    }
  }

  const duration = Date.now() - startTime;
  console.log(`All notifications sent in ${duration}ms`);
  console.log(`Average: ${(duration / notifications.length).toFixed(2)}ms per notification`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
