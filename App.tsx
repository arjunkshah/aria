import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SparklesIcon, UserIcon, LogoutIcon } from './components/Icons';
import LandingPage from './components/LandingPage';
import FeaturesPage from './components/FeaturesPage';
import MainApp from './components/MainApp';
import ThemeToggleButton from './components/ThemeToggleButton';
import NotificationButton from './components/NotificationButton';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

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
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-primary/30">
      <div className={`w-full ${isAppPage ? 'max-w-7xl' : 'max-w-5xl'}`}>
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-border">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-background-secondary group-hover:bg-primary transition-colors rounded-lg shadow-clay flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
            </div>
            <h1 className="text-2xl font-bold text-text-strong">Changelog</h1>
          </NavLink>
          <nav className="flex items-center gap-2 sm:gap-4">
            <NavLink to="/" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${isActive ? 'bg-background-secondary shadow-clay-inset text-text-strong' : 'text-text-secondary hover:bg-background-secondary/50 hover:text-text-primary'}`}>Home</NavLink>
            <NavLink to="/features" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${isActive ? 'bg-background-secondary shadow-clay-inset text-text-strong' : 'text-text-secondary hover:bg-background-secondary/50 hover:text-text-primary'}`}>Features</NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/app" className="hidden sm:block px-4 py-2 rounded-lg text-sm sm:text-base font-bold bg-primary text-white shadow-clay hover:bg-primary/90 transition-all">Dashboard</NavLink>
                <NotificationButton
                  projectId={user?.id}
                  userId={user?.id}
                />
                <div className="relative group">
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-background-secondary shadow-clay hover:shadow-clay-inset transition-all">
                    <UserIcon className="w-6 h-6 text-text-secondary" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-background-secondary rounded-lg shadow-clay border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-medium text-text-strong">{user?.name}</p>
                      <p className="text-xs text-text-secondary">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background/50 rounded-md transition-colors"
                      >
                        <LogoutIcon className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <NavLink to="/app" className="hidden sm:block px-4 py-2 rounded-lg text-sm sm:text-base font-bold bg-primary text-white shadow-clay hover:bg-primary/90 transition-all">Launch App</NavLink>
            )}

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
