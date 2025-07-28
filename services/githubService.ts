import { Repo, PullRequest } from '../types';

const GITHUB_API_URL = 'https://api.github.com';

export function parseRepoUrl(url: string): Repo {
  try {
    const urlObject = new URL(url);
    if (urlObject.hostname !== 'github.com') {
      throw new Error();
    }
    const pathParts = urlObject.pathname.split('/').filter(p => p);
    if (pathParts.length < 2) {
      throw new Error();
    }
    // Remove .git extension if present
    let repoName = pathParts[1];
    if (repoName.endsWith('.git')) {
      repoName = repoName.slice(0, -4);
    }
    return { owner: pathParts[0], name: repoName };
  } catch (error) {
    throw new Error('Invalid GitHub repository URL. Please use the format https://github.com/owner/repo.');
  }
}

async function apiFetch(url: string, token: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    if (!response.ok) {
        let errorMessage = response.statusText;
        let errorDetails = '';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.errors?.[0]?.message || errorMessage;
            errorDetails = errorData.errors?.[0]?.code || '';
        } catch {
            // If we can't parse the error response, use the status text
        }
        
        // Log detailed error information for debugging
        console.error('GitHub API Error Details:', {
            status: response.status,
            statusText: response.statusText,
            url: url,
            errorMessage: errorMessage,
            errorDetails: errorDetails
        });
        
        throw new Error(`GitHub API Error: ${errorMessage}${errorDetails ? ` (${errorDetails})` : ''}`);
    }
    return response.json();
}

export async function getMergedPRs(repo: Repo, token: string, since?: string): Promise<PullRequest[]> {
  try {
    // Validate repository format
    if (!repo.owner || !repo.name) {
      throw new Error('Invalid repository format');
    }

    // Clean repository name and owner - ensure .git extension is removed
    const cleanOwner = repo.owner.trim();
    let cleanName = repo.name.trim();
    
    // Remove .git extension if present (double-check)
    if (cleanName.endsWith('.git')) {
      cleanName = cleanName.slice(0, -4);
    }
    
    if (!cleanOwner || !cleanName) {
      throw new Error('Repository owner and name cannot be empty');
    }

    console.log('Original repo name:', repo.name);
    console.log('Cleaned repo name:', cleanName);

    let query = `is:pr is:merged repo:${cleanOwner}/${cleanName}`;
    if (since) {
      const sinceDate = new Date(since).toISOString().split('T')[0];
      query += ` merged:>=${sinceDate}`;
    }

    console.log('GitHub API Query:', query);
    const url = `${GITHUB_API_URL}/search/issues?q=${encodeURIComponent(query)}&sort=merged&order=desc`;
    console.log('GitHub API URL:', url);
    
    const data = await apiFetch(url, token);
    
    if (!data.items) {
      console.warn('No items in GitHub API response:', data);
      return [];
    }
    
    return data.items.map((pr: any) => ({
      id: pr.number,
      title: pr.title,
      body: pr.body,
      url: pr.html_url,
      author: pr.user?.login || 'Unknown',
      mergedAt: pr.pull_request?.merged_at
    }));
  } catch (error) {
    console.error('GitHub API Error:', error);
    throw error;
  }
}
