from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aria.db")

# Create engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class
Base = declarative_base()

# Database models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    avatar = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    projects = relationship("Project", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    user_id = Column(String, ForeignKey("users.id"))
    github_token = Column(String)
    user_email = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # Settings
    auto_generation = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    notification_types = Column(Text, default="[]")  # JSON string
    
    # Relationships
    user = relationship("User", back_populates="projects")
    repositories = relationship("Repository", back_populates="project")
    changelogs = relationship("Changelog", back_populates="project")

class Repository(Base):
    __tablename__ = "repositories"
    
    id = Column(String, primary_key=True, index=True)
    owner = Column(String)
    name = Column(String)
    full_name = Column(String)
    description = Column(Text, nullable=True)
    project_id = Column(String, ForeignKey("projects.id"))
    github_token = Column(String)
    last_checked = Column(DateTime, default=datetime.utcnow)
    last_changelog_version = Column(String, nullable=True)
    auto_gen_enabled = Column(Boolean, default=True)
    
    # Relationships
    project = relationship("Project", back_populates="repositories")
    changelogs = relationship("Changelog", back_populates="repository")

class Changelog(Base):
    __tablename__ = "changelogs"
    
    id = Column(String, primary_key=True, index=True)
    repo_id = Column(String, ForeignKey("repositories.id"))
    project_id = Column(String, ForeignKey("projects.id"))
    version = Column(String)
    title = Column(String)
    description = Column(Text)
    features = Column(Text)  # JSON string
    fixes = Column(Text)  # JSON string
    improvements = Column(Text)  # JSON string
    breaking = Column(Text)  # JSON string
    generated_at = Column(DateTime, default=datetime.utcnow)
    pr_count = Column(Integer, default=0)
    
    # Relationships
    repository = relationship("Repository", back_populates="changelogs")
    project = relationship("Project", back_populates="changelogs")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    project_id = Column(String, ForeignKey("projects.id"))
    title = Column(String)
    message = Column(Text)
    type = Column(String)  # success, error, info, warning
    timestamp = Column(DateTime, default=datetime.utcnow)
    read = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    project = relationship("Project")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine) 