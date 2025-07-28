export interface Repo {
  owner: string;
  name: string;
  id: string; // unique identifier
  lastUpdated?: string;
  changelogCount?: number;
}

export interface ConnectedRepo extends Repo {
  token: string;
  changelogs: HistoricalChangelog[];
  lastSync?: string;
}

export interface PullRequest {
  id: number;
  title: string;
  body: string | null;
  url: string;
  author: string;
  mergedAt: string | null;
}

export interface Changelog {
  features: string[];
  fixes: string[];
  improvements: string[];
}

export interface HistoricalChangelog {
  id: string; // e.g., 'v1.2.3'
  version: string;
  date: string;
  pullRequestIds: number[];
  changelog: Changelog;
  repoId: string;
}

export type AppStatus = 'initial' | 'loading' | 'error' | 'ready';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: number;
}

export interface AppSettings {
  globalToken?: string;
  autoSync: boolean;
  notifications: boolean;
  theme: 'light' | 'dark';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}
