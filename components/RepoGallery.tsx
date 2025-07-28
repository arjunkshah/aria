import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ConnectedRepo, AppSettings, Notification } from '../types';
import { GithubIcon, PlusIcon, SettingsIcon, BellIcon } from './Icons';
import Logo from './Logo';

interface RepoGalleryProps {
  connectedRepos: ConnectedRepo[];
  settings: AppSettings;
  notifications: Notification[];
  onConnectRepo: (repoUrl: string, token: string) => Promise<void>;
  onSelectRepo: (repo: ConnectedRepo) => void;
  onOpenSettings: () => void;
  onMarkNotificationRead: (id: string) => void;
}

const RepoCard: React.FC<{ repo: ConnectedRepo; onClick: () => void }> = ({ repo, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-background-secondary rounded-2xl p-6 shadow-clay-inset border border-border cursor-pointer hover:shadow-clay transition-all card group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-background rounded-xl shadow-clay flex items-center justify-center group-hover:shadow-clay-inset transition-all">
          <GithubIcon className="w-6 h-6 text-text-secondary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-strong font-inter">{repo.owner}/{repo.name}</h3>
          <p className="text-sm text-text-secondary font-inter">
            {repo.changelogCount || 0} changelogs
          </p>
        </div>
      </div>
      {repo.lastSync && (
        <span className="text-xs text-text-secondary font-inter">
          {new Date(repo.lastSync).toLocaleDateString()}
        </span>
      )}
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-text-secondary font-inter">Connected</span>
      </div>
      <div className="text-xs text-text-secondary font-inter">
        Last updated: {repo.lastUpdated ? new Date(repo.lastUpdated).toLocaleDateString() : 'Never'}
      </div>
    </div>
  </motion.div>
);

const ConnectRepoCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-background-secondary rounded-2xl p-6 shadow-clay-inset border border-border cursor-pointer hover:shadow-clay transition-all border-dashed border-2 card group"
  >
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-12 h-12 bg-background rounded-xl shadow-clay flex items-center justify-center mb-4 group-hover:shadow-clay-inset transition-all">
        <PlusIcon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-text-strong mb-2 font-inter">Connect Repository</h3>
      <p className="text-sm text-text-secondary font-inter">Add a new GitHub repository to generate changelogs</p>
    </div>
  </motion.div>
);

const RepoGallery: React.FC<RepoGalleryProps> = ({
  connectedRepos,
  settings,
  notifications,
  onConnectRepo,
  onSelectRepo,
  onOpenSettings,
  onMarkNotificationRead
}) => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl || !token) return;
    
    setIsConnecting(true);
    try {
      await onConnectRepo(repoUrl, token);
      setShowConnectModal(false);
      setRepoUrl('');
      setToken('');
    } catch (error) {
      console.error('Failed to connect repo:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-text-strong mb-2 font-inter">Repository Gallery</h1>
          <p className="text-text-secondary font-inter text-lg">Manage your connected repositories and changelogs</p>
        </div>
        <div className="flex items-center gap-4">
          {unreadNotifications.length > 0 && (
            <button className="relative p-2 rounded-lg hover:bg-background-secondary transition-colors">
              <BellIcon className="w-6 h-6 text-text-secondary" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full text-xs text-white flex items-center justify-center font-bold">
                {unreadNotifications.length}
              </span>
            </button>
          )}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-3 bg-background-secondary text-text-secondary rounded-lg shadow-clay hover:shadow-clay-inset transition-all btn-secondary"
          >
            <SettingsIcon className="w-5 h-5" />
            Settings
          </button>
        </div>
      </div>

      {/* Repository Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connectedRepos.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            onClick={() => onSelectRepo(repo)}
          />
        ))}
        <ConnectRepoCard onClick={() => setShowConnectModal(true)} />
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-background-secondary rounded-2xl p-8 shadow-clay max-w-md w-full mx-4 card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-strong font-inter">Connect Repository</h2>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-background"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
                  Repository URL
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary input font-inter"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
                  Personal Access Token
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary input font-inter"
                  required
                />
                <p className="text-xs text-text-secondary mt-2 font-inter">
                  Your token is stored securely and used for all repositories
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 px-4 py-3 bg-background text-text-secondary rounded-lg shadow-clay hover:shadow-clay-inset transition-all btn-secondary font-inter"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg shadow-clay hover:bg-primary/90 transition-all disabled:opacity-50 btn-primary font-inter"
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RepoGallery; 