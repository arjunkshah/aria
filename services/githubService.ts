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
    return { owner: pathParts[0], name: pathParts[1] };
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
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
    }
    return response.json();
}

export async function getMergedPRs(repo: Repo, token: string, since?: string): Promise<PullRequest[]> {
  let query = `is:pr is:merged repo:${repo.owner}/${repo.name}`;
  if (since) {
    const sinceDate = new Date(since).toISOString().split('T')[0];
    query += ` merged:>=${sinceDate}`;
  }

  const url = `${GITHUB_API_URL}/search/issues?q=${encodeURIComponent(query)}&sort=merged&order=desc`;
  
  const data = await apiFetch(url, token);
  
  return data.items.map((pr: any) => ({
    id: pr.number,
    title: pr.title,
    body: pr.body,
    url: pr.html_url,
    author: pr.user.login,
    mergedAt: pr.pull_request.merged_at
  }));
}
