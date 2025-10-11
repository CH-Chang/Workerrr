import notifier from 'node-notifier';

export interface NotificationOptions {
  title: string;
  message: string;
}

export const showNotification = (options: NotificationOptions) => {
  const { title, message } = options;

  notifier.notify({
    title,
    message,
    sound: true,
    wait: false
  });
};
