import { ConnectedRepo, HistoricalChangelog, Changelog } from '../types';
import { getMergedPRs } from './githubService';
import { generateChangelogFromPRs } from './geminiService';
import { notificationService } from './notificationService';

export interface AutoGenerationConfig {
  enabled: boolean;
  checkInterval: number; // in milliseconds
  repositories: ConnectedRepo[];
}

export class AutoGenerationService {
  private static instance: AutoGenerationService;
  private intervalId: NodeJS.Timeout | null = null;
  private config: AutoGenerationConfig = {
    enabled: false,
    checkInterval: 5 * 60 * 1000, // 5 minutes
    repositories: []
  };

  private constructor() {}

  static getInstance(): AutoGenerationService {
    if (!AutoGenerationService.instance) {
      AutoGenerationService.instance = new AutoGenerationService();
    }
    return AutoGenerationService.instance;
  }

  start(config: AutoGenerationConfig): void {
    this.config = config;
    
    if (!config.enabled || config.repositories.length === 0) {
      console.log('Auto-generation disabled or no repositories configured');
      return;
    }

    console.log('Starting auto-generation service...');
    
    // Initial check
    this.checkAllRepositories();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.checkAllRepositories();
    }, config.checkInterval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Auto-generation service stopped');
    }
  }

  updateConfig(config: Partial<AutoGenerationConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.enabled !== undefined || config.repositories !== undefined) {
      // Restart service with new config
      this.stop();
      if (this.config.enabled) {
        this.start(this.config);
      }
    }
  }

  private async checkAllRepositories(): Promise<void> {
    console.log('Checking repositories for new changes...');
    
    for (const repo of this.config.repositories) {
      try {
        await this.checkRepository(repo);
      } catch (error) {
        console.error(`Error checking repository ${repo.owner}/${repo.name}:`, error);
      }
    }
  }

  private async checkRepository(repo: ConnectedRepo): Promise<void> {
    try {
      // Get the last changelog date
      const lastChangelog = repo.changelogs[0];
      const sinceDate = lastChangelog?.date;
      
      // Check for new merged PRs
      const newPRs = await getMergedPRs(repo, repo.token, sinceDate);
      
      if (newPRs.length > 0) {
        console.log(`Found ${newPRs.length} new PRs for ${repo.owner}/${repo.name}`);
        
        // Generate new changelog
        const newVersion = this.generateVersionNumber(repo.changelogs);
        const changelogContent = await generateChangelogFromPRs(newPRs, newVersion);
        
        const newChangelog: HistoricalChangelog = {
          id: newVersion,
          version: newVersion,
          date: new Date().toISOString(),
          pullRequestIds: newPRs.map(p => p.id),
          changelog: changelogContent,
          repoId: repo.id,
        };

        // Update repository with new changelog
        const updatedRepo: ConnectedRepo = {
          ...repo,
          changelogs: [newChangelog, ...repo.changelogs],
          lastSync: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };

        // Trigger update callback
        this.onChangelogGenerated?.(updatedRepo, newChangelog);
        
        // Send notification
        await this.sendChangelogNotification(repo, newVersion, newPRs.length);
        
        console.log(`Generated changelog ${newVersion} for ${repo.owner}/${repo.name}`);
      }
    } catch (error) {
      console.error(`Error checking repository ${repo.owner}/${repo.name}:`, error);
    }
  }

  private generateVersionNumber(existingChangelogs: HistoricalChangelog[]): string {
    if (existingChangelogs.length === 0) {
      return 'v1.0.0';
    }

    // Get the latest version
    const latestVersion = existingChangelogs[0].version;
    const versionMatch = latestVersion.match(/v(\d+)\.(\d+)\.(\d+)/);
    
    if (versionMatch) {
      const major = parseInt(versionMatch[1]);
      const minor = parseInt(versionMatch[2]);
      const patch = parseInt(versionMatch[3]);
      return `v${major}.${minor}.${patch + 1}`;
    }

    // Fallback: increment patch version
    return 'v1.0.1';
  }

  private async sendChangelogNotification(
    repo: ConnectedRepo, 
    version: string, 
    prCount: number
  ): Promise<void> {
    const title = `New Changelog Generated`;
    const body = `Generated ${version} for ${repo.owner}/${repo.name} with ${prCount} new changes`;
    
    await notificationService.sendNotification(title, {
      body,
      data: {
        repoId: repo.id,
        version,
        prCount
      }
    });
  }

  // Callback for when a new changelog is generated
  onChangelogGenerated?: (repo: ConnectedRepo, changelog: HistoricalChangelog) => void;

  getStatus(): { enabled: boolean; repositories: number; lastCheck?: Date } {
    return {
      enabled: this.config.enabled,
      repositories: this.config.repositories.length,
      lastCheck: this.intervalId ? new Date() : undefined
    };
  }
}

export const autoGenerationService = AutoGenerationService.getInstance(); 