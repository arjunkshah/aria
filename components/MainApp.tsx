import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firebase';
import { notificationService } from '../services/notificationService';
import { Project, Repository, Changelog } from '../types';
import { PlusIcon, SettingsIcon, RefreshIcon } from './Icons';
import LoginForm from './Auth/LoginForm';
import RegisterForm from './Auth/RegisterForm';
import { AnimatePresence } from 'framer-motion';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProjects();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (selectedProject) {
      loadRepositories();
      loadChangelogs();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    if (!user) return;
    
    setIsLoadingProjects(true);
    try {
      const userProjects = await firestoreService.getProjects(user.id);
      setProjects(userProjects);
      if (userProjects.length > 0 && !selectedProject) {
        setSelectedProject(userProjects[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadRepositories = async () => {
    if (!selectedProject) return;
    
    try {
      const projectRepos = await firestoreService.getRepositories(selectedProject.id);
      setRepositories(projectRepos);
    } catch (error) {
      console.error('Error loading repositories:', error);
    }
  };

  const loadChangelogs = async () => {
    if (!selectedProject) return;
    
    try {
      const projectChangelogs = await firestoreService.getChangelogs(selectedProject.id);
      setChangelogs(projectChangelogs);
    } catch (error) {
      console.error('Error loading changelogs:', error);
    }
  };

  const createProject = async () => {
    if (!user || !newProjectName.trim()) return;
    
    try {
      const project: Project = {
        id: crypto.randomUUID(),
        name: newProjectName,
        description: newProjectDescription,
        userId: user.id,
        githubToken: '',
        userEmail: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {
          autoGeneration: true,
          emailNotifications: true,
          notificationTypes: ['changelog', 'error', 'project']
        }
      };
      
      await firestoreService.createProject(project);
      setProjects(prev => [project, ...prev]);
      setSelectedProject(project);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateProject(false);
      
      // Send notification
      await notificationService.createFirestoreNotification(
        user.id,
        project.id,
        'Project Created',
        `Project "${project.name}" has been created successfully.`,
        'success'
      );
      
      await notificationService.sendProjectNotification(project.name, 'created');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleTestNotification = async () => {
    if (!user || !selectedProject) return;
    
    try {
      await notificationService.sendChangelogNotification(
        'test-repo',
        'v1.0.0',
        ['Added new feature', 'Fixed bug', 'Improved performance']
      );
      
      await notificationService.createFirestoreNotification(
        user.id,
        selectedProject.id,
        'Test Notification',
        'This is a test notification to verify the system is working.',
        'info'
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <AnimatePresence mode="wait">
          {showAuth === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <LoginForm />
            </motion.div>
          )}
          {showAuth === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterForm />
            </motion.div>
          )}
          {!showAuth && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-text-strong mb-4">Welcome to ARIA</h2>
              <p className="text-text-secondary mb-8">Sign in to start managing your projects and generating changelogs.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowAuth('login')}
                  className="btn-primary"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowAuth('register')}
                  className="btn-secondary"
                >
                  Create Account
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-strong">Dashboard</h1>
          <p className="text-text-secondary">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleTestNotification}
            className="btn-secondary"
          >
            Test Notification
          </button>
          <button
            onClick={() => setShowCreateProject(true)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Project
          </button>
        </div>
      </div>

      {/* Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingProjects ? (
          <div className="col-span-full flex justify-center">
            <div className="spinner"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-text-strong mb-2">No projects yet</h3>
            <p className="text-text-secondary mb-4">Create your first project to get started</p>
            <button
              onClick={() => setShowCreateProject(true)}
              className="btn-primary"
            >
              Create Project
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`project-card cursor-pointer transition-all ${
                selectedProject?.id === project.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedProject(project)}
            >
              <div className="project-header">
                <h3 className="text-lg font-semibold text-text-strong">{project.name}</h3>
                <SettingsIcon className="w-5 h-5 text-text-secondary" />
              </div>
              <p className="text-text-secondary text-sm mb-4">{project.description}</p>
              <div className="project-stats">
                <div className="stat-item">
                  <div className="stat-value">{repositories.filter(r => r.projectId === project.id).length}</div>
                  <div className="stat-label">Repositories</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{changelogs.filter(c => c.projectId === project.id).length}</div>
                  <div className="stat-label">Changelogs</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{project.settings.autoGeneration ? 'On' : 'Off'}</div>
                  <div className="stat-label">Auto-Gen</div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="modal-overlay" onClick={() => setShowCreateProject(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-text-strong mb-4">Create New Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="input"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Enter project description"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createProject}
                    disabled={!newProjectName.trim()}
                    className="btn-primary flex-1"
                  >
                    Create Project
                  </button>
                  <button
                    onClick={() => setShowCreateProject(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Project Details */}
      {selectedProject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-strong">{selectedProject.name}</h2>
            <button
              onClick={loadProjects}
              className="btn-secondary"
            >
              <RefreshIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-text-strong mb-4">Repositories</h3>
              {repositories.length === 0 ? (
                <p className="text-text-secondary">No repositories connected yet.</p>
              ) : (
                <div className="space-y-2">
                  {repositories.map((repo) => (
                    <div key={repo.id} className="p-3 bg-background rounded-lg">
                      <div className="font-medium text-text-strong">{repo.fullName}</div>
                      <div className="text-sm text-text-secondary">Last checked: {new Date(repo.lastChecked).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-text-strong mb-4">Recent Changelogs</h3>
              {changelogs.length === 0 ? (
                <p className="text-text-secondary">No changelogs generated yet.</p>
              ) : (
                <div className="space-y-2">
                  {changelogs.slice(0, 3).map((changelog) => (
                    <div key={changelog.id} className="p-3 bg-background rounded-lg">
                      <div className="font-medium text-text-strong">{changelog.version}</div>
                      <div className="text-sm text-text-secondary">{changelog.title}</div>
                      <div className="text-xs text-text-secondary">{new Date(changelog.generatedAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MainApp; 