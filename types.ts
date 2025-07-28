export interface Repo {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  description?: string;
  lastUpdated: string;
  changelogCount: number;
  autoGenEnabled: boolean;
}

export interface ConnectedRepo extends Repo {
  projectId: string;
  githubToken: string;
  lastChecked: string;
  lastChangelogVersion?: string;
}

export interface Changelog {
  id: string;
  repoId: string;
  version: string;
  title: string;
  description: string;
  features: string[];
  fixes: string[];
  improvements: string[];
  breaking: string[];
  generatedAt: string;
  prCount: number;
}

export interface HistoricalChangelog extends Changelog {
  repoId: string;
  projectId: string;
  userId: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  autoGeneration: boolean;
  emailNotifications: boolean;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: string;
  read: boolean;
  projectId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  settings: AppSettings;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  userId: string;
  githubToken: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    autoGeneration: boolean;
    emailNotifications: boolean;
    notificationTypes: string[];
  };
}

export interface Repository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  description?: string;
  projectId: string;
  githubToken: string;
  lastChecked: string;
  lastChangelogVersion?: string;
  autoGenEnabled: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 