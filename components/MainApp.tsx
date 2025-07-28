import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon, GitHubIcon, PlusIcon, SettingsIcon } from './Icons';
import LoginForm from './Auth/LoginForm';
import RegisterForm from './Auth/RegisterForm';
import ProjectCard from './ProjectCard';
import RepositoryCard from './RepositoryCard';
import ChangelogCard from './ChangelogCard';
import { Project, Repository, Changelog } from '../types';

const MainApp: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load user data
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-background-secondary rounded-xl shadow-clay flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-strong mb-2">
              Welcome to Changelog
            </h1>
            <p className="text-text-secondary">
              Generate beautiful, AI-powered changelogs for your GitHub repositories
            </p>
          </div>

          {showAuth === 'login' ? (
            <LoginForm onSwitchToRegister={() => setShowAuth('register')} />
          ) : showAuth === 'register' ? (
            <RegisterForm onSwitchToLogin={() => setShowAuth('login')} />
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setShowAuth('login')}
                className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-clay hover:shadow-clay-inset transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuth('register')}
                className="w-full px-6 py-3 bg-background-secondary text-text-primary font-semibold rounded-lg shadow-clay hover:shadow-clay-inset transition-all"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-background-secondary rounded-xl shadow-clay flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <p className="text-text-secondary">Loading Changelog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-strong">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your projects and generate changelogs with AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-background-secondary rounded-lg shadow-clay hover:shadow-clay-inset transition-all">
            <SettingsIcon className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Projects Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-strong">Your Projects</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-clay hover:shadow-clay-inset transition-all">
            <PlusIcon className="w-4 h-4" />
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-background-secondary rounded-xl p-8 text-center shadow-clay">
            <div className="w-16 h-16 bg-background rounded-xl shadow-clay flex items-center justify-center mx-auto mb-4">
              <GitHubIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-strong mb-2">
              No projects yet
            </h3>
            <p className="text-text-secondary mb-6">
              Create your first project to start generating changelogs with AI
            </p>
            <button className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-clay hover:shadow-clay-inset transition-all">
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-strong">Recent Activity</h2>
        
        {/* Recent Repositories */}
        {repositories.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-strong">Connected Repositories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repositories.slice(0, 3).map((repo) => (
                <RepositoryCard key={repo.id} repository={repo} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Changelogs */}
        {changelogs.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-strong">Recent Changelogs</h3>
            <div className="space-y-4">
              {changelogs.slice(0, 3).map((changelog) => (
                <ChangelogCard key={changelog.id} changelog={changelog} />
              ))}
            </div>
          </div>
        )}

        {repositories.length === 0 && changelogs.length === 0 && (
          <div className="bg-background-secondary rounded-xl p-8 text-center shadow-clay">
            <div className="w-16 h-16 bg-background rounded-xl shadow-clay flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-strong mb-2">
              No activity yet
            </h3>
            <p className="text-text-secondary">
              Connect a repository to start generating changelogs
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MainApp; 