export interface Repo {
  owner: string;
  name: string;
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
}

export type AppStatus = 'initial' | 'loading' | 'error' | 'ready';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: number;
}
