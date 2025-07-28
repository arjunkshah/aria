import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRightIcon, SparklesIcon } from './Icons';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const LandingPage: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center py-12 sm:py-20"
    >
      <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-background-secondary text-primary rounded-full px-4 py-1 mb-6 text-sm font-medium shadow-clay-inset">
        <SparklesIcon className="w-4 h-4" />
        <span>Powered by Gemini 2.5 Flash</span>
      </motion.div>
      <motion.h1 variants={itemVariants} className="text-4xl font-extrabold tracking-tight text-text-strong sm:text-6xl">
        Stop Writing Changelogs Manually.
      </motion.h1>
      <motion.p variants={itemVariants} className="mt-6 text-lg max-w-2xl mx-auto leading-8 text-text-primary">
        Connect your GitHub repository and let <span className="font-bold text-text-strong">Aria</span> automatically generate clean, categorized release notes from your pull requests in seconds.
      </motion.p>
      <motion.div variants={itemVariants} className="mt-10 flex items-center justify-center gap-x-6">
        <NavLink
          to="/app"
          className="flex items-center gap-2 px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl shadow-clay hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
        >
          Start Generating
          <ChevronRightIcon className="w-5 h-5" />
        </NavLink>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-20 max-w-4xl mx-auto">
        <div className="bg-background-secondary rounded-2xl p-6 shadow-clay-inset border border-border">
            <p className="text-left font-mono text-sm text-green-400">## 🚀 Features</p>
            <p className="text-left font-mono text-sm text-text-primary">- Added single sign-on (SSO) with Google for easier user access.</p>
            <p className="text-left font-mono text-sm text-text-primary">- Introduced a new dashboard analytics view for project administrators.</p>
            <br/>
            <p className="text-left font-mono text-sm text-red-400">## 🐛 Fixes</p>
            <p className="text-left font-mono text-sm text-text-primary">- Corrected a pagination issue that affected user lists with over 100 entries.</p>
            <br/>
            <p className="text-left font-mono text-sm text-amber-400">## 🔧 Improvements</p>
            <p className="text-left font-mono text-sm text-text-primary">- Optimized database queries to improve API response times by up to 30%.</p>
            <p className="text-left font-mono text-sm text-text-primary">- Upgraded the rendering engine for data grids, resulting in smoother scrolling.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LandingPage;