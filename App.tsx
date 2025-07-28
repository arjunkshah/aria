import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SparklesIcon } from './components/Icons';
import LandingPage from './components/LandingPage';
import FeaturesPage from './components/FeaturesPage';
import MainApp from './components/MainApp';
import ThemeToggleButton from './components/ThemeToggleButton';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const App: React.FC = () => {
  const location = useLocation();
  const isAppPage = location.pathname === '/app';

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-primary/30">
       <div className={`w-full ${isAppPage ? 'max-w-7xl' : 'max-w-5xl'}`}>
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-border">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-background-secondary group-hover:bg-primary transition-colors rounded-lg shadow-clay flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
            </div>
            <h1 className="text-2xl font-bold text-text-strong">Aria</h1>
          </NavLink>
          <nav className="flex items-center gap-2 sm:gap-4">
            <NavLink to="/" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${isActive ? 'bg-background-secondary shadow-clay-inset text-text-strong' : 'text-text-secondary hover:bg-background-secondary/50 hover:text-text-primary'}`}>Home</NavLink>
            <NavLink to="/features" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${isActive ? 'bg-background-secondary shadow-clay-inset text-text-strong' : 'text-text-secondary hover:bg-background-secondary/50 hover:text-text-primary'}`}>Features</NavLink>
            <NavLink to="/app" className="hidden sm:block px-4 py-2 rounded-lg text-sm sm:text-base font-bold bg-primary text-white shadow-clay hover:bg-primary/90 transition-all">Launch App</NavLink>
            <ThemeToggleButton />
          </nav>
        </header>

        <main>
           <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Routes location={location}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/app" element={<MainApp />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
       <footer className="w-full max-w-5xl text-center mt-12 text-text-secondary text-sm">
        <p>Built with Claymorphism & AI ✦ A Project by a World-Class Senior Frontend Engineer</p>
      </footer>
    </div>
  );
};

export default App;
