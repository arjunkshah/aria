from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import json
import os
import requests
import schedule
import time
import threading
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ARIA API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
projects = {}
connected_repos = {}
notifications = []
auto_generation_tasks = {}

# Pydantic models
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    github_token: str

class RepositoryConnect(BaseModel):
    project_id: str
    repo_url: str
    token: Optional[str] = None

class NotificationCreate(BaseModel):
    type: str  # 'success', 'error', 'info', 'warning'
    title: str
    message: str

class AutoGenerationConfig(BaseModel):
    enabled: bool = True
    check_interval: int = 300  # 5 minutes in seconds
    project_id: str

class ChangelogEntry(BaseModel):
    version: str
    date: str
    changes: List[str]
    pull_request_ids: List[int]

# GitHub API helper
class GitHubService:
    def __init__(self, token: str):
        self.token = token
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
    
    def parse_repo_url(self, url: str) -> tuple:
        """Parse GitHub repository URL to owner and name"""
        try:
            # Remove .git extension if present
            if url.endswith('.git'):
                url = url[:-4]
            
            # Extract owner and repo name
            parts = url.rstrip('/').split('/')
            if len(parts) < 2:
                raise ValueError("Invalid GitHub URL format")
            
            owner = parts[-2]
            repo_name = parts[-1]
            
            return owner, repo_name
        except Exception as e:
            raise ValueError(f"Failed to parse repository URL: {e}")
    
    def get_merged_prs(self, owner: str, repo: str, since_date: Optional[str] = None) -> List[Dict]:
        """Get merged pull requests since a specific date"""
        try:
            # Clean repo name (remove .git if present)
            if repo.endswith('.git'):
                repo = repo[:-4]
            
            query = f"is:pr is:merged repo:{owner}/{repo}"
            if since_date:
                query += f" merged:>={since_date}"
            
            url = f"https://api.github.com/search/issues?q={query}&sort=merged&order=desc"
            
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            return data.get('items', [])
            
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=f"GitHub API error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching PRs: {str(e)}")

# Auto-generation service
class AutoGenerationService:
    def __init__(self):
        self.running = False
        self.tasks = {}
    
    def start_monitoring(self, project_id: str, config: AutoGenerationConfig):
        """Start monitoring repositories for a project"""
        if project_id in self.tasks:
            self.stop_monitoring(project_id)
        
        self.tasks[project_id] = {
            'config': config,
            'running': True,
            'last_check': None
        }
        
        # Start background task
        asyncio.create_task(self._monitor_project(project_id))
        print(f"Started auto-generation monitoring for project {project_id}")
    
    def stop_monitoring(self, project_id: str):
        """Stop monitoring repositories for a project"""
        if project_id in self.tasks:
            self.tasks[project_id]['running'] = False
            print(f"Stopped auto-generation monitoring for project {project_id}")
    
    async def _monitor_project(self, project_id: str):
        """Background task to monitor repositories"""
        while project_id in self.tasks and self.tasks[project_id]['running']:
            try:
                await self._check_repositories(project_id)
                await asyncio.sleep(self.tasks[project_id]['config'].check_interval)
            except Exception as e:
                print(f"Error monitoring project {project_id}: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying
    
    async def _check_repositories(self, project_id: str):
        """Check all repositories for a project for new merged PRs"""
        if project_id not in connected_repos:
            return
        
        project_repos = connected_repos[project_id]
        github_service = GitHubService(projects[project_id]['github_token'])
        
        for repo_id, repo_data in project_repos.items():
            try:
                owner, repo_name = github_service.parse_repo_url(repo_data['repo_url'])
                
                # Get last changelog date
                last_changelog_date = None
                if repo_data.get('changelogs'):
                    last_changelog_date = repo_data['changelogs'][0]['date']
                
                # Get new merged PRs
                prs = github_service.get_merged_prs(owner, repo_name, last_changelog_date)
                
                if prs:
                    print(f"Found {len(prs)} new PRs for {owner}/{repo_name}")
                    
                    # Generate changelog
                    changelog = await self._generate_changelog(prs, repo_data)
                    
                    # Update repository data
                    repo_data['changelogs'].insert(0, changelog)
                    repo_data['last_updated'] = datetime.now().isoformat()
                    
                    # Send notification
                    await self._send_notification(project_id, {
                        'type': 'success',
                        'title': 'Auto-Generated Changelog',
                        'message': f"Generated {changelog['version']} for {owner}/{repo_name} with {len(prs)} changes"
                    })
                    
                    print(f"Generated changelog {changelog['version']} for {owner}/{repo_name}")
                
            except Exception as e:
                print(f"Error checking repository {repo_id}: {e}")
    
    async def _generate_changelog(self, prs: List[Dict], repo_data: Dict) -> Dict:
        """Generate changelog from pull requests"""
        # Simple changelog generation (replace with AI service)
        version = self._increment_version(repo_data.get('changelogs', []))
        
        changes = []
        for pr in prs:
            changes.append(f"- {pr['title']} (#{pr['number']})")
        
        return {
            'version': version,
            'date': datetime.now().isoformat(),
            'changes': changes,
            'pull_request_ids': [pr['number'] for pr in prs]
        }
    
    def _increment_version(self, existing_changelogs: List[Dict]) -> str:
        """Increment version number"""
        if not existing_changelogs:
            return 'v1.0.0'
        
        latest_version = existing_changelogs[0]['version']
        # Simple version increment (v1.0.0 -> v1.0.1)
        if latest_version.startswith('v'):
            try:
                parts = latest_version[1:].split('.')
                if len(parts) >= 3:
                    major, minor, patch = int(parts[0]), int(parts[1]), int(parts[2])
                    return f"v{major}.{minor}.{patch + 1}"
            except:
                pass
        
        return 'v1.0.1'
    
    async def _send_notification(self, project_id: str, notification: Dict):
        """Send notification for a project"""
        notification['id'] = len(notifications) + 1
        notification['timestamp'] = datetime.now().isoformat()
        notification['project_id'] = project_id
        notification['read'] = False
        
        notifications.append(notification)
        print(f"Notification sent: {notification['title']} - {notification['message']}")

# Initialize services
auto_generation_service = AutoGenerationService()

# API Endpoints

@app.get("/")
async def root():
    return {"message": "ARIA API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Project management
@app.post("/projects")
async def create_project(project: ProjectCreate):
    """Create a new project"""
    project_id = f"project_{len(projects) + 1}"
    
    projects[project_id] = {
        'id': project_id,
        'name': project.name,
        'description': project.description,
        'github_token': project.github_token,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    connected_repos[project_id] = {}
    
    print(f"Created project: {project.name} (ID: {project_id})")
    return {"project_id": project_id, "message": "Project created successfully"}

@app.get("/projects")
async def list_projects():
    """List all projects"""
    return {
        "projects": [
            {
                "id": pid,
                "name": pdata['name'],
                "description": pdata['description'],
                "created_at": pdata['created_at'],
                "repo_count": len(connected_repos.get(pid, {}))
            }
            for pid, pdata in projects.items()
        ]
    }

@app.get("/projects/{project_id}")
async def get_project(project_id: str):
    """Get project details"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects[project_id]
    repos = connected_repos.get(project_id, {})
    
    return {
        "project": project,
        "repositories": repos,
        "auto_generation": project_id in auto_generation_service.tasks
    }

# Repository management
@app.post("/repositories/connect")
async def connect_repository(repo_data: RepositoryConnect):
    """Connect a GitHub repository to a project"""
    if repo_data.project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Use project token if no specific token provided
    token = repo_data.token or projects[repo_data.project_id]['github_token']
    github_service = GitHubService(token)
    
    try:
        owner, repo_name = github_service.parse_repo_url(repo_data.repo_url)
        repo_id = f"{owner}/{repo_name}"
        
        # Test the connection by fetching repository info
        test_url = f"https://api.github.com/repos/{owner}/{repo_name}"
        response = requests.get(test_url, headers=github_service.headers)
        response.raise_for_status()
        
        # Store repository data
        connected_repos[repo_data.project_id][repo_id] = {
            'repo_url': repo_data.repo_url,
            'owner': owner,
            'name': repo_name,
            'connected_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),
            'changelogs': []
        }
        
        print(f"Connected repository: {repo_id} to project {repo_data.project_id}")
        return {"message": f"Repository {repo_id} connected successfully", "repo_id": repo_id}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to connect repository: {str(e)}")

@app.get("/repositories/{project_id}")
async def list_repositories(project_id: str):
    """List all repositories for a project"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    repos = connected_repos.get(project_id, {})
    return {"repositories": repos}

# Auto-generation management
@app.post("/auto-generation/start")
async def start_auto_generation(config: AutoGenerationConfig):
    """Start auto-generation for a project"""
    if config.project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    auto_generation_service.start_monitoring(config.project_id, config)
    
    return {"message": f"Auto-generation started for project {config.project_id}"}

@app.post("/auto-generation/stop")
async def stop_auto_generation(project_id: str):
    """Stop auto-generation for a project"""
    auto_generation_service.stop_monitoring(project_id)
    
    return {"message": f"Auto-generation stopped for project {project_id}"}

@app.get("/auto-generation/status")
async def get_auto_generation_status():
    """Get status of all auto-generation tasks"""
    status = {}
    for project_id, task in auto_generation_service.tasks.items():
        status[project_id] = {
            "running": task['running'],
            "config": task['config'].dict(),
            "last_check": task['last_check']
        }
    
    return {"auto_generation_status": status}

# Changelog management
@app.get("/changelogs/{project_id}")
async def get_changelogs(project_id: str):
    """Get all changelogs for a project"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    all_changelogs = []
    repos = connected_repos.get(project_id, {})
    
    for repo_id, repo_data in repos.items():
        for changelog in repo_data.get('changelogs', []):
            changelog['repo_id'] = repo_id
            all_changelogs.append(changelog)
    
    # Sort by date (newest first)
    all_changelogs.sort(key=lambda x: x['date'], reverse=True)
    
    return {"changelogs": all_changelogs}

@app.post("/changelogs/generate")
async def generate_changelog(project_id: str, repo_id: str):
    """Manually generate a changelog for a repository"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_id not in connected_repos or repo_id not in connected_repos[project_id]:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    repo_data = connected_repos[project_id][repo_id]
    github_service = GitHubService(projects[project_id]['github_token'])
    
    try:
        owner, repo_name = github_service.parse_repo_url(repo_data['repo_url'])
        
        # Get merged PRs since last changelog
        last_changelog_date = None
        if repo_data.get('changelogs'):
            last_changelog_date = repo_data['changelogs'][0]['date']
        
        prs = github_service.get_merged_prs(owner, repo_name, last_changelog_date)
        
        if not prs:
            return {"message": "No new merged pull requests found"}
        
        # Generate changelog
        changelog = await auto_generation_service._generate_changelog(prs, repo_data)
        
        # Update repository data
        repo_data['changelogs'].insert(0, changelog)
        repo_data['last_updated'] = datetime.now().isoformat()
        
        return {
            "message": f"Generated changelog {changelog['version']}",
            "changelog": changelog,
            "pr_count": len(prs)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate changelog: {str(e)}")

# Notification management
@app.get("/notifications/{project_id}")
async def get_notifications(project_id: str):
    """Get notifications for a project"""
    project_notifications = [n for n in notifications if n.get('project_id') == project_id]
    return {"notifications": project_notifications}

@app.post("/notifications/mark-read")
async def mark_notification_read(notification_id: int):
    """Mark a notification as read"""
    for notification in notifications:
        if notification.get('id') == notification_id:
            notification['read'] = True
            return {"message": "Notification marked as read"}
    
    raise HTTPException(status_code=404, detail="Notification not found")

# WebSocket for real-time updates
@app.websocket("/ws/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: str):
    await websocket.accept()
    
    try:
        while True:
            # Send periodic updates
            await asyncio.sleep(30)
            
            # Get project status
            if project_id in projects:
                status = {
                    "type": "status_update",
                    "project_id": project_id,
                    "repositories": len(connected_repos.get(project_id, {})),
                    "auto_generation": project_id in auto_generation_service.tasks,
                    "timestamp": datetime.now().isoformat()
                }
                await websocket.send_text(json.dumps(status))
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for project {project_id}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 