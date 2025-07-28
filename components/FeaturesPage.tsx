import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { SparklesIcon, GitHubIcon, ZapIcon, ShieldIcon, BellIcon, SettingsIcon } from './Icons';

const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: <SparklesIcon className="w-8 h-8 text-primary" />,
      title: "AI-Powered Generation",
      description: "Our advanced AI analyzes your GitHub repository to automatically generate comprehensive changelogs that capture the essence of your changes.",
      details: [
        "Intelligent categorization of changes (features, fixes, improvements)",
        "Context-aware descriptions based on commit messages and PR titles",
        "Automatic version detection and semantic versioning",
        "Support for multiple programming languages and frameworks"
      ]
    },
    {
      icon: <GitHubIcon className="w-8 h-8 text-primary" />,
      title: "Seamless GitHub Integration",
      description: "Connect your GitHub repositories with a single click and let Changelog handle the rest automatically.",
      details: [
        "One-click repository connection",
        "Automatic PR and commit tracking",
        "Real-time sync with your GitHub workflow",
        "Support for public and private repositories"
      ]
    },
    {
      icon: <ZapIcon className="w-8 h-8 text-primary" />,
      title: "Real-time Automation",
      description: "Set up automatic changelog generation that triggers on new releases, pull requests, or commits.",
      details: [
        "Automatic generation on new releases",
        "Webhook integration for instant updates",
        "Customizable automation rules",
        "Scheduled generation for regular releases"
      ]
    },
    {
      icon: <BellIcon className="w-8 h-8 text-primary" />,
      title: "Smart Notifications",
      description: "Stay informed with intelligent notifications about new changes, generated changelogs, and important updates.",
      details: [
        "Browser notifications for new changelogs",
        "Email notifications for important updates",
        "Customizable notification preferences",
        "Team collaboration notifications"
      ]
    },
    {
      icon: <ShieldIcon className="w-8 h-8 text-primary" />,
      title: "Enterprise Security",
      description: "Your data and repositories are protected with enterprise-grade security and privacy controls.",
      details: [
        "OAuth 2.0 authentication with GitHub",
        "Encrypted data storage",
        "Role-based access controls",
        "Audit logs for compliance"
      ]
    },
    {
      icon: <SettingsIcon className="w-8 h-8 text-primary" />,
      title: "Customizable Templates",
      description: "Create custom changelog templates that match your project's style and requirements.",
      details: [
        "Custom markdown templates",
        "Branded changelog styling",
        "Multiple output formats (Markdown, HTML, JSON)",
        "Template versioning and management"
      ]
    }
  ];

  return (
    <div className="space-y-16">
      {/* Header */}
      <section className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-text-strong">
            Powerful Features for Modern Development
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Changelog combines cutting-edge AI with developer-friendly tools to revolutionize how you create and manage release notes.
          </p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="space-y-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`flex flex-col lg:flex-row gap-8 items-start ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
          >
            <div className="lg:w-1/2 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-background-secondary rounded-xl shadow-clay flex items-center justify-center">
                  {feature.icon}
                </div>
                <h2 className="text-2xl font-bold text-text-strong">
                  {feature.title}
                </h2>
              </div>
              <p className="text-lg text-text-secondary leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-text-primary">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-background-secondary rounded-xl p-6 shadow-clay">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-text-secondary">Example Output</span>
                  </div>
                  <div className="bg-background rounded-lg p-4 font-mono text-sm">
                    <div className="text-green-400">## 🚀 New Features</div>
                    <div className="text-text-primary mt-2">• Added advanced AI-powered changelog generation</div>
                    <div className="text-text-primary">• Implemented real-time GitHub integration</div>
                    <div className="text-text-primary">• Created customizable notification system</div>
                    <div className="text-red-400 mt-4">## 🐛 Bug Fixes</div>
                    <div className="text-text-primary mt-2">• Fixed authentication flow issues</div>
                    <div className="text-amber-400 mt-4">## 🔧 Improvements</div>
                    <div className="text-text-primary mt-2">• Enhanced UI/UX with claymorphism design</div>
                    <div className="text-text-primary">• Optimized performance for large repositories</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center space-y-6 bg-background-secondary rounded-2xl p-8 shadow-clay"
      >
        <h2 className="text-3xl font-bold text-text-strong">
          Ready to Transform Your Release Process?
        </h2>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Join thousands of developers who are already saving hours with Changelog's AI-powered automation.
        </p>
        <NavLink
          to="/app"
          className="inline-block px-8 py-4 bg-primary text-white font-bold rounded-lg shadow-clay hover:shadow-clay-inset transition-all text-lg"
        >
          Start Using Changelog Free
        </NavLink>
      </motion.section>
    </div>
  );
};

export default FeaturesPage;