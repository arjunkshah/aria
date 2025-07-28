import React from 'react';
import { motion } from 'framer-motion';
import { Repository } from '../types';
import { GitHubIcon } from './Icons';

interface RepositoryCardProps {
  repository: Repository;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-secondary rounded-lg p-4 shadow-clay hover:shadow-clay-inset transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-background rounded-lg shadow-clay flex items-center justify-center flex-shrink-0">
          <GitHubIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text-strong truncate">{repository.fullName}</h4>
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {repository.description || 'No description available'}
          </p>
          <div className="flex items-center justify-between mt-3 text-xs text-text-secondary">
            <span>Last checked: {new Date(repository.lastChecked).toLocaleDateString()}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              repository.autoGenEnabled 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {repository.autoGenEnabled ? 'Auto-gen On' : 'Auto-gen Off'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RepositoryCard; 