import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSettings } from '../types';
import { SettingsIcon, SunIcon, MoonIcon, CheckIcon, BellIcon, ZapIcon } from './Icons';
import { notificationService } from '../services/notificationService';

interface SettingsProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClose: () => void;
  isOpen: boolean;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSaveSettings, onClose, isOpen }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showToken, setShowToken] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [settings]);

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleRequestNotificationPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const granted = await notificationService.requestPermission();
      setNotificationPermission(granted ? 'granted' : 'denied');
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-background-secondary rounded-2xl p-8 shadow-clay max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-strong flex items-center gap-3 font-inter">
                <SettingsIcon className="w-6 h-6" />
                Settings
              </h2>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-background"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Global Token */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
                  GitHub Personal Access Token
                </label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={localSettings.globalToken || ''}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, globalToken: e.target.value }))}
                    placeholder="ghp_..."
                    className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary pr-12 input font-inter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showToken ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-xs text-text-secondary mt-2 font-inter">
                  This token will be used for all connected repositories. Required scopes: <code className="bg-background p-1 rounded-sm text-xs">repo</code>.
                </p>
              </div>

              {/* Auto Generation */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.autoSync}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <div className="flex items-center gap-2">
                    <ZapIcon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-text-primary font-inter">Auto-generate changelogs</span>
                  </div>
                </label>
                <p className="text-xs text-text-secondary mt-1 ml-7 font-inter">
                  Automatically generate changelogs when new pull requests are merged
                </p>
              </div>

              {/* Notifications */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <div className="flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-text-primary font-inter">Enable notifications</span>
                  </div>
                </label>
                <p className="text-xs text-text-secondary mt-1 ml-7 font-inter">
                  Show browser notifications when new changelogs are generated
                </p>
              </div>

              {/* Notification Permission */}
              {localSettings.notifications && (
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BellIcon className="w-5 h-5 text-text-secondary" />
                      <span className="text-sm font-medium text-text-primary font-inter">Browser Notifications</span>
                    </div>
                    <span className={`text-xs font-inter ${
                      notificationPermission === 'granted' ? 'text-green-400' : 
                      notificationPermission === 'denied' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {notificationPermission === 'granted' ? 'Enabled' : 
                       notificationPermission === 'denied' ? 'Blocked' : 'Not set'}
                    </span>
                  </div>
                  {notificationPermission !== 'granted' && (
                    <button
                      onClick={handleRequestNotificationPermission}
                      disabled={isRequestingPermission}
                      className="w-full px-4 py-2 bg-primary text-white rounded-lg shadow-clay hover:bg-primary/90 transition-all disabled:opacity-50 btn-primary font-inter text-sm"
                    >
                      {isRequestingPermission ? 'Requesting...' : 'Enable Notifications'}
                    </button>
                  )}
                  <p className="text-xs text-text-secondary mt-2 font-inter">
                    Allow browser notifications to receive alerts when changelogs are auto-generated
                  </p>
                </div>
              )}

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3 font-inter">
                  Theme
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLocalSettings(prev => ({ ...prev, theme: 'light' }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all font-inter ${
                      localSettings.theme === 'light'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-text-secondary hover:bg-background-secondary'
                    }`}
                  >
                    <SunIcon className="w-5 h-5" />
                    Light
                  </button>
                  <button
                    onClick={() => setLocalSettings(prev => ({ ...prev, theme: 'dark' }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all font-inter ${
                      localSettings.theme === 'dark'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-text-secondary hover:bg-background-secondary'
                    }`}
                  >
                    <MoonIcon className="w-5 h-5" />
                    Dark
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-border">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-background text-text-secondary rounded-lg shadow-clay hover:shadow-clay-inset transition-all btn-secondary font-inter"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg shadow-clay hover:bg-primary/90 transition-all flex items-center justify-center gap-2 btn-primary font-inter"
              >
                <CheckIcon className="w-5 h-5" />
                Save Settings
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Settings; 