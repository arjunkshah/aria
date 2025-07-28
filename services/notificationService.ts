import { firestoreService } from './firebase';
import { AppNotification } from '../types';

class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    this.checkPermission();
  }

  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async sendNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        return false;
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'aria-notification',
        requireInteraction: false,
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  async sendChangelogNotification(repoName: string, version: string, changes: string[]): Promise<boolean> {
    const title = `🚀 New Changelog: ${version}`;
    const body = `Generated for ${repoName}\n${changes.slice(0, 3).join('\n')}${changes.length > 3 ? '\n...' : ''}`;
    
    return this.sendNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'changelog-notification',
      data: {
        type: 'changelog',
        repoName,
        version,
        changes
      }
    });
  }

  async sendProjectNotification(projectName: string, action: string): Promise<boolean> {
    const title = `🔔 Project Update: ${action}`;
    const body = `Your project "${projectName}" has been updated.`;
    
    return this.sendNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'project-notification',
      data: {
        type: 'project',
        projectName,
        action
      }
    });
  }

  async sendErrorNotification(error: string, projectName?: string): Promise<boolean> {
    const title = `⚠️ Error Alert${projectName ? `: ${projectName}` : ''}`;
    const body = error.length > 100 ? error.substring(0, 100) + '...' : error;
    
    return this.sendNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'error-notification',
      data: {
        type: 'error',
        error,
        projectName
      }
    });
  }

  async createFirestoreNotification(
    userId: string,
    projectId: string,
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ): Promise<string> {
    const notification: Omit<AppNotification, 'id'> = {
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      projectId
    };

    return await firestoreService.createNotification(notification);
  }

  async getNotifications(projectId: string, userId: string): Promise<AppNotification[]> {
    return await firestoreService.getNotifications(projectId, userId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await firestoreService.markNotificationAsRead(notificationId);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await firestoreService.deleteNotification(notificationId);
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }
}

export const notificationService = new NotificationService(); 