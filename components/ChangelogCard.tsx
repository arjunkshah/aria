import React from 'react';
import { motion } from 'framer-motion';
import { Changelog } from '../types';
import { SparklesIcon } from './Icons';

interface ChangelogCardProps {
  changelog: Changelog;
}

const ChangelogCard: React.FC<ChangelogCardProps> = ({ changelog }) => {
  const totalChanges = changelog.features.length + changelog.fixes.length + changelog.improvements.length + changelog.breaking.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-secondary rounded-lg p-4 shadow-clay hover:shadow-clay-inset transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-background rounded-lg shadow-clay flex items-center justify-center flex-shrink-0">
          <SparklesIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-text-strong">{changelog.version}</h4>
            <span className="text-xs text-text-secondary">
              {new Date(changelog.generatedAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
            {changelog.title}
          </p>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>{totalChanges} changes</span>
            <span>{changelog.prCount} PRs</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChangelogCard; 