export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = {
    granted: false,
    denied: false,
    default: false
  };

  private constructor() {
    this.checkPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission(): void {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    switch (Notification.permission) {
      case 'granted':
        this.permission.granted = true;
        break;
      case 'denied':
        this.permission.denied = true;
        break;
      default:
        this.permission.default = true;
        break;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.checkPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'aria-changelog',
        requireInteraction: false,
        silent: false,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  getPermissionStatus(): NotificationPermission {
    return { ...this.permission };
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }
}

export const notificationService = NotificationService.getInstance(); 