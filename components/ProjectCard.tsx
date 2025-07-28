import React from 'react';
import { motion } from 'framer-motion';
import { Project } from '../types';
import { SettingsIcon } from './Icons';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-secondary rounded-xl p-6 shadow-clay hover:shadow-clay-inset transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-strong">{project.name}</h3>
          <p className="text-sm text-text-secondary mt-1">{project.description}</p>
        </div>
        <button className="p-2 bg-background rounded-lg shadow-clay hover:shadow-clay-inset transition-all">
          <SettingsIcon className="w-4 h-4 text-text-secondary" />
        </button>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="text-text-secondary">
          Created {new Date(project.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-text-strong">0</div>
            <div className="text-xs text-text-secondary">Repos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-text-strong">0</div>
            <div className="text-xs text-text-secondary">Changelogs</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard; 