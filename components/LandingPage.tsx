import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { SparklesIcon, GitHubIcon, ZapIcon, ShieldIcon } from './Icons';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <SparklesIcon className="w-8 h-8 text-primary" />,
      title: "AI-Powered Generation",
      description: "Automatically generate beautiful changelogs using advanced AI that understands your codebase and commit history."
    },
    {
      icon: <GitHubIcon className="w-8 h-8 text-primary" />,
      title: "GitHub Integration",
      description: "Seamlessly connect your GitHub repositories and automatically track pull requests, commits, and releases."
    },
    {
      icon: <ZapIcon className="w-8 h-8 text-primary" />,
      title: "Real-time Updates",
      description: "Get instant notifications when new changes are detected and automatically generate updated changelogs."
    },
    {
      icon: <ShieldIcon className="w-8 h-8 text-primary" />,
      title: "Secure & Private",
      description: "Your data stays private and secure with enterprise-grade authentication and encrypted storage."
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-background-secondary rounded-xl shadow-clay flex items-center justify-center">
              <SparklesIcon className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-strong">
            Generate Beautiful
            <span className="text-primary block">Changelogs</span>
            with AI
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Automatically create professional changelogs for your GitHub repositories using advanced AI. 
            Save hours of manual work and never miss important changes again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink
              to="/app"
              className="px-8 py-4 bg-primary text-white font-bold rounded-lg shadow-clay hover:shadow-clay-inset transition-all text-lg"
            >
              Get Started Free
            </NavLink>
            <NavLink
              to="/features"
              className="px-8 py-4 bg-background-secondary text-text-primary font-medium rounded-lg shadow-clay hover:shadow-clay-inset transition-all text-lg"
            >
              Learn More
            </NavLink>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-4"
        >
          <h2 className="text-3xl font-bold text-text-strong">
            Why Choose Changelog?
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Built for developers who want to focus on coding, not documentation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="bg-background-secondary rounded-xl p-6 shadow-clay hover:shadow-clay-inset transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-text-strong">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center space-y-6 bg-background-secondary rounded-2xl p-8 shadow-clay"
      >
        <h2 className="text-3xl font-bold text-text-strong">
          Ready to Transform Your Release Process?
        </h2>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Join thousands of developers who are already saving hours with AI-powered changelog generation.
        </p>
        <NavLink
          to="/app"
          className="inline-block px-8 py-4 bg-primary text-white font-bold rounded-lg shadow-clay hover:shadow-clay-inset transition-all text-lg"
        >
          Start Generating Changelogs
        </NavLink>
      </motion.section>
    </div>
  );
};

export default LandingPage;