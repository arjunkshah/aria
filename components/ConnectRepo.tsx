import React, { useState } from 'react';
import { GithubIcon } from './Icons';

interface ConnectRepoProps {
  onConnect: (repoUrl: string, token: string) => void;
  loading: boolean;
}

const ConnectRepo: React.FC<ConnectRepoProps> = ({ onConnect, loading }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl && token) {
      onConnect(repoUrl, token);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-background-secondary p-8 rounded-2xl shadow-clay-inset border border-border">
      <div className="text-center">
        <GithubIcon className="w-12 h-12 text-text-secondary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-text-strong">Connect Your Repository</h2>
        <p className="text-text-primary mt-2">
          Enter your repository URL and a GitHub Personal Access Token to begin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="repoUrl" className="block text-sm font-medium text-text-primary mb-2">
            Repository URL
          </label>
          <input
            id="repoUrl"
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="https://github.com/owner/repo"
            required
          />
        </div>

        <div>
          <label htmlFor="token" className="block text-sm font-medium text-text-primary mb-2">
            GitHub Personal Access Token
          </label>
          <input
            id="token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="ghp_..."
            required
          />
           <p className="text-xs text-text-secondary mt-2">
            Your token is stored only in your browser's local storage and is never sent to our servers. Required scopes: <code className="bg-background p-1 rounded-sm text-xs">repo</code>.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !repoUrl || !token}
          className="w-full py-3 font-bold bg-primary text-white rounded-lg shadow-clay hover:bg-primary/90 transition-all disabled:bg-background-secondary disabled:text-text-secondary disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Connecting...
            </>
          ) : (
            'Connect to GitHub'
          )}
        </button>
      </form>
    </div>
  );
};

export default ConnectRepo;