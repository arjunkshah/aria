from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer
from typing import List, Optional, Dict, Any
import asyncio
import json
import os
import requests
import time
import threading
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Import our modules
from database import get_db, create_tables, User, Project, Repository, Changelog, Notification
from auth import get_current_user, authenticate_user, create_user, create_access_token, update_last_login
from email_service import email_service

load_dotenv()

app = FastAPI(title="ARIA API", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()
    print("✅ Database tables created")

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "features": ["authentication", "database", "auto-generation", "email"]
    }

# Authentication endpoints
@app.post("/auth/register")
async def register(request: Dict, db: Session = Depends(get_db)):
    try:
        email = request.get("email")
        password = request.get("password")
        name = request.get("name")
        
        if not all([email, password, name]):
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        user = create_user(db, email, password, name)
        if not user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create access token
        access_token = create_access_token(data={"sub": user.id})
        
        return {
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "created_at": user.created_at.isoformat()
            },
            "token": access_token
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/login")
async def login(request: Dict, db: Session = Depends(get_db)):
    try:
        email = request.get("email")
        password = request.get("password")
        
        if not all([email, password]):
            raise HTTPException(status_code=400, detail="Missing email or password")
        
        user = authenticate_user(db, email, password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Update last login
        update_last_login(db, user.id)
        
        # Create access token
        access_token = create_access_token(data={"sub": user.id})
        
        return {
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "created_at": user.created_at.isoformat(),
                "last_login": user.last_login.isoformat()
            },
            "token": access_token
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/auth/verify")
async def verify_token(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "created_at": current_user.created_at.isoformat(),
            "last_login": current_user.last_login.isoformat()
        }
    }

# Project management endpoints
@app.post("/projects")
async def create_project(
    request: Dict, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        project_id = str(uuid.uuid4())
        
        project = Project(
            id=project_id,
            name=request.get("name", "Unnamed Project"),
            description=request.get("description", ""),
            user_id=current_user.id,
            github_token=request.get("github_token", ""),
            user_email=request.get("user_email", current_user.email),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            auto_generation=request.get("auto_generation", True),
            email_notifications=request.get("email_notifications", True),
            notification_types=json.dumps(request.get("notification_types", []))
        )
        
        db.add(project)
        db.commit()
        db.refresh(project)
        
        print(f"Created project: {project.name} (ID: {project_id})")
        
        return {
            "success": True,
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "user_id": project.user_id,
                "created_at": project.created_at.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects")
async def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        projects = db.query(Project).filter(Project.user_id == current_user.id).all()
        
        return {
            "success": True,
            "projects": [
                {
                    "id": project.id,
                    "name": project.name,
                    "description": project.description,
                    "created_at": project.created_at.isoformat(),
                    "updated_at": project.updated_at.isoformat(),
                    "auto_generation": project.auto_generation,
                    "email_notifications": project.email_notifications
                }
                for project in projects
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Repository management endpoints
@app.post("/repositories/connect")
async def connect_repository(
    request: Dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        project_id = request.get("project_id")
        repo_url = request.get("repo_url")
        github_token = request.get("github_token")
        
        if not all([project_id, repo_url, github_token]):
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Parse repository URL
        if "github.com" in repo_url:
            parts = repo_url.replace("https://github.com/", "").replace(".git", "").split("/")
            if len(parts) != 2:
                raise HTTPException(status_code=400, detail="Invalid GitHub URL")
            owner, name = parts
        else:
            raise HTTPException(status_code=400, detail="Only GitHub repositories are supported")
        
        # Check if repository already exists
        existing_repo = db.query(Repository).filter(
            Repository.project_id == project_id,
            Repository.full_name == f"{owner}/{name}"
        ).first()
        
        if existing_repo:
            raise HTTPException(status_code=400, detail="Repository already connected")
        
        # Create repository record
        repo_id = str(uuid.uuid4())
        repository = Repository(
            id=repo_id,
            owner=owner,
            name=name,
            full_name=f"{owner}/{name}",
            project_id=project_id,
            github_token=github_token,
            last_checked=datetime.utcnow(),
            auto_gen_enabled=True
        )
        
        db.add(repository)
        db.commit()
        db.refresh(repository)
        
        print(f"Connected repository: {repository.full_name} to project {project_id}")
        
        return {
            "success": True,
            "repository": {
                "id": repository.id,
                "owner": repository.owner,
                "name": repository.name,
                "full_name": repository.full_name,
                "project_id": repository.project_id
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/repositories/{project_id}")
async def get_repositories(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Verify project belongs to user
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == current_user.id
        ).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        repositories = db.query(Repository).filter(Repository.project_id == project_id).all()
        
        return {
            "success": True,
            "repositories": [
                {
                    "id": repo.id,
                    "owner": repo.owner,
                    "name": repo.name,
                    "full_name": repo.full_name,
                    "description": repo.description,
                    "last_checked": repo.last_checked.isoformat(),
                    "auto_gen_enabled": repo.auto_gen_enabled
                }
                for repo in repositories
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Changelog endpoints
@app.post("/changelogs/generate")
async def generate_changelog(
    project_id: str,
    repo_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Verify project belongs to user
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == current_user.id
        ).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get repository
        repository = db.query(Repository).filter(
            Repository.id == repo_id,
            Repository.project_id == project_id
        ).first()
        
        if not repository:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        # Generate changelog (simplified for now)
        changelog_id = str(uuid.uuid4())
        changelog = Changelog(
            id=changelog_id,
            repo_id=repo_id,
            project_id=project_id,
            version="v1.0.0",
            title=f"Changelog for {repository.full_name}",
            description="Auto-generated changelog",
            features=json.dumps(["Feature 1", "Feature 2"]),
            fixes=json.dumps(["Bug fix 1"]),
            improvements=json.dumps(["Performance improvement"]),
            breaking=json.dumps([]),
            generated_at=datetime.utcnow(),
            pr_count=3
        )
        
        db.add(changelog)
        db.commit()
        db.refresh(changelog)
        
        return {
            "success": True,
            "changelog": {
                "id": changelog.id,
                "version": changelog.version,
                "title": changelog.title,
                "description": changelog.description,
                "generated_at": changelog.generated_at.isoformat(),
                "pr_count": changelog.pr_count
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/changelogs/{project_id}")
async def get_changelogs(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Verify project belongs to user
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == current_user.id
        ).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        changelogs = db.query(Changelog).filter(Changelog.project_id == project_id).all()
        
        return {
            "success": True,
            "changelogs": [
                {
                    "id": changelog.id,
                    "version": changelog.version,
                    "title": changelog.title,
                    "description": changelog.description,
                    "generated_at": changelog.generated_at.isoformat(),
                    "pr_count": changelog.pr_count
                }
                for changelog in changelogs
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Notification endpoints
@app.get("/notifications/{project_id}")
async def get_notifications(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Verify project belongs to user
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == current_user.id
        ).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        notifications = db.query(Notification).filter(
            Notification.project_id == project_id,
            Notification.user_id == current_user.id
        ).order_by(Notification.timestamp.desc()).all()
        
        return {
            "success": True,
            "notifications": [
                {
                    "id": notification.id,
                    "title": notification.title,
                    "message": notification.message,
                    "type": notification.type,
                    "timestamp": notification.timestamp.isoformat(),
                    "read": notification.read
                }
                for notification in notifications
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Email endpoints
@app.get("/email/status")
async def get_email_status():
    return {
        "enabled": email_service.enabled,
        "configured": email_service.enabled,
        "smtp_server": email_service.smtp_server,
        "smtp_port": email_service.smtp_port
    }

@app.post("/email/test")
async def test_email(
    request: Dict,
    current_user: User = Depends(get_current_user)
):
    try:
        email = request.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email required")
        
        success = email_service.send_email(
            email,
            "ARIA Email Test",
            "This is a test email from ARIA platform."
        )
        
        return {
            "success": success,
            "message": "Test email sent" if success else "Failed to send email"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 