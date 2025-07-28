import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, CheckIcon, XMarkIcon } from './Icons';
import { notificationService } from '../services/notificationService';
import { AppNotification } from '../types';

interface NotificationButtonProps {
  projectId?: string;
  userId?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ projectId, userId }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    setPermissionStatus(notificationService.getPermissionStatus());
  }, []);

  useEffect(() => {
    if (projectId && userId) {
      loadNotifications();
    }
  }, [projectId, userId]);

  const loadNotifications = async () => {
    if (!projectId || !userId) return;
    
    setIsLoading(true);
    try {
      const notifications = await notificationService.getNotifications(projectId, userId);
      setNotifications(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermissionStatus(notificationService.getPermissionStatus());
    
    if (granted) {
      // Show success notification
      await notificationService.sendNotification(
        'Notifications Enabled',
        { body: 'You will now receive notifications from ARIA' }
      );
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-background-secondary shadow-clay hover:shadow-clay-inset transition-all"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6 text-text-secondary" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-background-secondary rounded-xl shadow-clay border border-border z-50"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-strong">Notifications</h3>
                {permissionStatus !== 'granted' && (
                  <button
                    onClick={handleRequestPermission}
                    className="text-xs px-2 py-1 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-text-secondary">
                  <div className="spinner mx-auto mb-2"></div>
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-text-secondary">
                  <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg mb-2 transition-all ${
                        notification.read 
                          ? 'bg-background/50 text-text-secondary' 
                          : 'bg-background-secondary shadow-clay-inset'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-text-strong text-sm">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-text-secondary hover:text-success transition-colors"
                                title="Mark as read"
                              >
                                <CheckIcon className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="p-1 text-text-secondary hover:text-error transition-colors"
                                title="Delete"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-text-secondary mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-text-secondary mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-border">
                <button
                  onClick={() => {
                    notifications.forEach(n => {
                      if (!n.read) handleMarkAsRead(n.id);
                    });
                  }}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationButton; 