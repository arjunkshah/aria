import React from 'react';
import { motion } from 'framer-motion';
import { GithubIcon, SparklesIcon, MessageIcon, BookOpenIcon, ZapIcon } from './Icons';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <motion.div
        variants={itemVariants}
        className="bg-background-secondary rounded-2xl p-6 shadow-clay-inset border border-border flex flex-col items-start"
    >
        <div className="w-12 h-12 bg-background rounded-lg shadow-clay flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-text-strong mb-2">{title}</h3>
        <p className="text-text-primary leading-relaxed">{children}</p>
    </motion.div>
);

const FeaturesPage: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
        <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-text-strong sm:text-5xl">Powerful Features, Effortless Changelogs</h2>
            <p className="mt-4 text-lg text-text-primary">Aria combines the power of AI with direct GitHub integration to streamline your release process.</p>
        </div>

        <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-8">
            <FeatureCard title="Direct GitHub Integration" icon={<GithubIcon className="w-7 h-7 text-text-secondary" />}>
                Connect any public or private repository using a Personal Access Token. Aria securely fetches your merged pull requests to ensure no contribution is missed.
            </FeatureCard>
            <FeatureCard title="AI-Powered Summarization" icon={<SparklesIcon className="w-7 h-7 text-primary" />}>
                Our core AI model reads PR titles, descriptions, and even linked issue details to generate clear, human-readable summaries for every change.
            </FeatureCard>
             <FeatureCard title="Automated Categorization" icon={<ZapIcon className="w-7 h-7 text-amber-400" />}>
                Aria intelligently categorizes each summary into 🚀 Features, 🐛 Fixes, or 🔧 Improvements, giving your changelog a clean, organized structure instantly.
            </FeatureCard>
            <FeatureCard title="Interactive AI Editing" icon={<MessageIcon className="w-7 h-7 text-cyan-400" />}>
                Use the "Aria" chat assistant to refine your changelog. Ask it to rephrase entries, combine points, or change the tone—all through simple conversation.
            </FeatureCard>
            <FeatureCard title="Version History" icon={<BookOpenIcon className="w-7 h-7 text-green-400" />}>
                Keep a complete record of all generated changelogs. View, copy, or edit past versions at any time, providing a clear audit trail of your product's evolution.
            </FeatureCard>
            <FeatureCard title="Dual-Mode Theming" icon={<div className="text-2xl">🌗</div>}>
                Enjoy a beautiful interface in either light or dark mode. Your preference is saved automatically for a personalized experience.
            </FeatureCard>
        </motion.div>
    </motion.div>
  );
};

export default FeaturesPage;