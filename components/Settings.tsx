import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppSettings } from '../types';
import { SettingsIcon, SunIcon, MoonIcon, CheckIcon } from './Icons';

interface SettingsProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSaveSettings, onClose }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showToken, setShowToken] = useState(false);

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background-secondary rounded-2xl p-8 shadow-clay max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-strong flex items-center gap-3">
            <SettingsIcon className="w-6 h-6" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Global Token */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              GitHub Personal Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={localSettings.globalToken || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, globalToken: e.target.value }))}
                placeholder="ghp_..."
                className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary pr-12"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                {showToken ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              This token will be used for all connected repositories. Required scopes: <code className="bg-background p-1 rounded-sm">repo</code>.
            </p>
          </div>

          {/* Auto Sync */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoSync}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-sm font-medium text-text-primary">Auto-sync repositories</span>
            </label>
            <p className="text-xs text-text-secondary mt-1 ml-7">
              Automatically check for new pull requests and generate changelogs
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
              <span className="text-sm font-medium text-text-primary">Enable notifications</span>
            </label>
            <p className="text-xs text-text-secondary mt-1 ml-7">
              Show notifications when new changelogs are generated
            </p>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Theme
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, theme: 'light' }))}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
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
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
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
            className="flex-1 px-4 py-3 bg-background text-text-secondary rounded-lg shadow-clay hover:shadow-clay-inset transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg shadow-clay hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <CheckIcon className="w-5 h-5" />
            Save Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings; 