import React, { useState, useMemo } from 'react';
import { Changelog } from '../types';
import { ClipboardIcon, CheckIcon } from './Icons';

interface ChangelogDisplayProps {
  changelog: Changelog | null;
  version: string;
}

const ChangelogSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 text-text-strong font-inter border-b border-border pb-2">
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-text-primary font-inter leading-relaxed">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
            <span className="text-base font-normal">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ChangelogDisplay: React.FC<ChangelogDisplayProps> = ({ changelog, version }) => {
  const [copied, setCopied] = useState(false);

  const markdownContent = useMemo(() => {
    if (!changelog) return '';
    
    let content = `# Changelog - ${version}\n\n`;
    if (changelog.features?.length > 0) {
      content += `## Features\n`;
      changelog.features.forEach(item => content += `- ${item}\n`);
      content += '\n';
    }
    if (changelog.fixes?.length > 0) {
      content += `## Fixes\n`;
      changelog.fixes.forEach(item => content += `- ${item}\n`);
      content += '\n';
    }
    if (changelog.improvements?.length > 0) {
      content += `## Improvements\n`;
      changelog.improvements.forEach(item => content += `- ${item}\n`);
      content += '\n';
    }
    return content.trim();
  }, [changelog, version]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!changelog) {
    return (
      <div className="flex-grow flex items-center justify-center bg-background-secondary rounded-2xl shadow-clay-inset p-8 card">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-strong font-inter mb-3">No Changelog Selected</h2>
          <p className="text-text-secondary mt-2 font-inter text-base">Select a version from the left or generate a new changelog.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-secondary rounded-2xl shadow-clay-inset p-8 w-full card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold text-text-strong font-inter mb-2">
            Changelog
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-primary font-inter">{version}</span>
            <span className="text-sm text-text-secondary font-inter">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center self-start sm:self-center gap-2 px-4 py-3 bg-background text-text-secondary rounded-lg shadow-clay hover:shadow-clay-inset transition-all duration-200 btn-secondary mt-4 sm:mt-0"
        >
          {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
          {copied ? 'Copied!' : 'Copy Markdown'}
        </button>
      </div>

      {/* Content */}
      <div className="font-inter text-text-primary">
        <ChangelogSection title="Features" items={changelog.features || []} />
        <ChangelogSection title="Fixes" items={changelog.fixes || []} />
        <ChangelogSection title="Improvements" items={changelog.improvements || []} />
      </div>
    </div>
  );
};

export default ChangelogDisplay; 