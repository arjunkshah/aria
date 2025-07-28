import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chat } from "@google/genai";
import { ConnectedRepo, HistoricalChangelog, AppStatus, ChatMessage, Changelog, AppSettings, Notification } from '../types';
import { generateChangelogFromPRs, createAriaChat } from '../services/geminiService';
import { getMergedPRs, parseRepoUrl } from '../services/githubService';
import RepoGallery from './RepoGallery';
import Settings from './Settings';
import ChangelogDisplay from './ChangelogDisplay';
import AriaChat from './AriaChat';
import Logo from './Logo';
import { BookOpenIcon, ZapIcon, ArrowPathIcon, BellIcon } from './Icons';

const MainApp: React.FC = () => {
    const [status, setStatus] = useState<AppStatus>('initial');
    const [error, setError] = useState<string | null>(null);
    
    const [connectedRepos, setConnectedRepos] = useState<ConnectedRepo[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<ConnectedRepo | null>(null);
    const [selectedChangelog, setSelectedChangelog] = useState<HistoricalChangelog | null>(null);
    const [newVersion, setNewVersion] = useState('v1.0.0');

    const [ariaChat, setAriaChat] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    const [settings, setSettings] = useState<AppSettings>({
        globalToken: '',
        autoSync: true,
        notifications: true,
        theme: 'dark'
    });

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        // Load saved data
        const savedRepos = localStorage.getItem('connectedRepos');
        const savedSettings = localStorage.getItem('appSettings');
        const savedNotifications = localStorage.getItem('notifications');

        if (savedRepos) {
            setConnectedRepos(JSON.parse(savedRepos));
        }
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
        if (savedNotifications) {
            setNotifications(JSON.parse(savedNotifications));
        }

        setAriaChat(createAriaChat());
    }, []);

    const saveState = (key: string, value: any) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: Date.now(),
            read: false
        };
        const updatedNotifications = [newNotification, ...notifications];
        setNotifications(updatedNotifications);
        saveState('notifications', updatedNotifications);
    };

    const handleConnectRepo = async (repoUrl: string, token: string) => {
        setStatus('loading');
        setError(null);
        try {
            const parsedRepo = parseRepoUrl(repoUrl);
            const repoId = `${parsedRepo.owner}/${parsedRepo.name}`;
            
            // Check if repo already exists
            if (connectedRepos.find(r => r.id === repoId)) {
                throw new Error('Repository already connected');
            }

            const newRepo: ConnectedRepo = {
                ...parsedRepo,
                id: repoId,
                token: token,
                changelogs: [],
                lastSync: new Date().toISOString()
            };

            const updatedRepos = [...connectedRepos, newRepo];
            setConnectedRepos(updatedRepos);
            saveState('connectedRepos', updatedRepos);

            // Update global token if not set
            if (!settings.globalToken) {
                const updatedSettings = { ...settings, globalToken: token };
                setSettings(updatedSettings);
                saveState('appSettings', updatedSettings);
            }

            addNotification({
                type: 'success',
                title: 'Repository Connected',
                message: `Successfully connected ${repoId}`
            });

            setStatus('ready');
        } catch (e) {
            const err = e as Error;
            setError(err.message);
            setStatus('error');
            addNotification({
                type: 'error',
                title: 'Connection Failed',
                message: err.message
            });
        }
    };

    const handleSelectRepo = (repo: ConnectedRepo) => {
        setSelectedRepo(repo);
        setSelectedChangelog(null);
        setChatHistory([]);
    };

    const handleGenerate = async () => {
        if (!selectedRepo || !selectedRepo.token) return;
        setStatus('loading');
        setError(null);
        try {
            console.log('Generating changelog for repository:', selectedRepo);
            console.log('Repository owner:', selectedRepo.owner);
            console.log('Repository name:', selectedRepo.name);
            
            // Clean repository name if it has .git extension
            let cleanRepo = { ...selectedRepo };
            if (cleanRepo.name.endsWith('.git')) {
                cleanRepo.name = cleanRepo.name.slice(0, -4);
                console.log('Cleaned repository name from:', selectedRepo.name, 'to:', cleanRepo.name);
            }
            
            const lastGeneratedDate = selectedRepo.changelogs[0]?.date;
            const prs = await getMergedPRs(cleanRepo, selectedRepo.token, lastGeneratedDate);
            
            if (prs.length === 0) {
                setError("No new merged pull requests found since the last changelog.");
                setStatus('ready');
                setTimeout(() => setError(null), 3000);
                return;
            }

            const changelogContent = await generateChangelogFromPRs(prs, newVersion);
            const newEntry: HistoricalChangelog = {
                id: newVersion,
                version: newVersion,
                date: new Date().toISOString(),
                pullRequestIds: prs.map(p => p.id),
                changelog: changelogContent,
                repoId: selectedRepo.id,
            };
            
            const updatedChangelogs = [newEntry, ...selectedRepo.changelogs];
            const updatedRepo = { ...selectedRepo, changelogs: updatedChangelogs, lastSync: new Date().toISOString() };
            
            const updatedRepos = connectedRepos.map(r => r.id === selectedRepo.id ? updatedRepo : r);
            setConnectedRepos(updatedRepos);
            setSelectedRepo(updatedRepo);
            setSelectedChangelog(newEntry);
            saveState('connectedRepos', updatedRepos);

            addNotification({
                type: 'success',
                title: 'Changelog Generated',
                message: `Generated changelog for ${selectedRepo.owner}/${selectedRepo.name} v${newVersion}`
            });

            setStatus('ready');
        } catch (e) {
            const err = e as Error;
            console.error('Error generating changelog:', err);
            setError(`Failed to generate: ${err.message}`);
            setStatus('ready');
            addNotification({
                type: 'error',
                title: 'Generation Failed',
                message: err.message
            });
        }
    };

    const handleAriaSendMessage = async (message: string, currentChangelog: Changelog) => {
        if (!ariaChat || !selectedChangelog) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }], timestamp: Date.now() };
        setChatHistory(prev => [...prev, userMessage]);
        setIsEditing(true);

        try {
            const prompt = `User request: "${message}". Current changelog JSON: ${JSON.stringify(currentChangelog)}`;
            const response = await ariaChat.sendMessage({ message: prompt });
            const responseText = response.text.trim();
            const editedChangelog = JSON.parse(responseText) as Changelog;

            const modelMessage: ChatMessage = { role: 'model', parts: [{ text: "Here's the updated changelog." }], timestamp: Date.now() + 1 };
            
            const updatedEntry: HistoricalChangelog = { ...selectedChangelog, changelog: editedChangelog };
            
            const updatedChangelogs = selectedRepo!.changelogs.map(h => h.id === selectedChangelog.id ? updatedEntry : h);
            const updatedRepo = { ...selectedRepo!, changelogs: updatedChangelogs };
            
            const updatedRepos = connectedRepos.map(r => r.id === selectedRepo!.id ? updatedRepo : r);
            setConnectedRepos(updatedRepos);
            setSelectedRepo(updatedRepo);
            setSelectedChangelog(updatedEntry);
            saveState('connectedRepos', updatedRepos);
            setChatHistory(prev => [...prev, modelMessage]);

        } catch (e) {
            console.error("Aria chat error:", e);
            const err = e as Error;
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: `Sorry, I ran into an error: ${err.message}` }], timestamp: Date.now() + 1 };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsEditing(false);
        }
    };

    const handleSaveSettings = (newSettings: AppSettings) => {
        setSettings(newSettings);
        saveState('appSettings', newSettings);
    };

    const handleMarkNotificationRead = (id: string) => {
        const updatedNotifications = notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        );
        setNotifications(updatedNotifications);
        saveState('notifications', updatedNotifications);
    };

    // Show gallery if no repo is selected
    if (!selectedRepo) {
        return (
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b border-border bg-background-secondary/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <Logo size="lg" />
                    </div>
                </header>
                
                <RepoGallery
                    connectedRepos={connectedRepos}
                    settings={settings}
                    notifications={notifications}
                    onConnectRepo={handleConnectRepo}
                    onSelectRepo={handleSelectRepo}
                    onOpenSettings={() => setShowSettings(true)}
                    onMarkNotificationRead={handleMarkNotificationRead}
                />
                
                <Settings
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                    onClose={() => setShowSettings(false)}
                    isOpen={showSettings}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-background-secondary/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Logo size="md" />
                        <button
                            onClick={() => setSelectedRepo(null)}
                            className="text-sm text-text-secondary hover:text-text-primary transition-colors font-inter px-4 py-2 rounded-lg hover:bg-background-secondary"
                        >
                            ← Back to Gallery
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                    {/* Left Column: History */}
                    <motion.div 
                        className="lg:col-span-3 bg-background-secondary rounded-2xl p-6 shadow-clay-inset border border-border flex flex-col card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="flex-shrink-0 border-b border-border pb-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xl font-bold text-text-strong flex items-center gap-3 font-inter">
                                    <BookOpenIcon className="w-5 h-5"/>
                                    Changelog History
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <p className="text-sm text-text-secondary font-inter">{selectedRepo.owner}/{selectedRepo.name}</p>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                            {selectedRepo.changelogs.map(h => (
                                <motion.button 
                                    key={h.id} 
                                    onClick={() => setSelectedChangelog(h)} 
                                    className={`w-full text-left p-4 rounded-xl transition-all font-inter ${
                                        selectedChangelog?.id === h.id 
                                            ? 'bg-primary/10 text-text-strong border border-primary/20 shadow-clay' 
                                            : 'hover:bg-background/50 text-text-primary border border-transparent hover:border-border'
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <p className="font-bold text-lg">{h.version}</p>
                                    <p className="text-xs text-text-secondary mt-1">{new Date(h.date).toLocaleDateString()}</p>
                                </motion.button>
                            ))}
                        </div>
                        <div className="flex-shrink-0 pt-4 border-t border-border">
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={newVersion}
                                    onChange={(e) => setNewVersion(e.target.value)}
                                    placeholder="New version (e.g. v1.2.4)"
                                    className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary input font-inter"
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={status === 'loading'}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 font-bold bg-primary text-white rounded-lg shadow-clay hover:bg-primary/90 transition-all disabled:bg-background-secondary disabled:text-text-secondary disabled:shadow-none disabled:cursor-not-allowed btn-primary font-inter"
                                >
                                    {status === 'loading' && <ArrowPathIcon className="w-5 h-5 animate-spin"/>}
                                    {status === 'loading' ? 'Checking for PRs...' : <><ZapIcon className="w-5 h-5" /> Generate New</>}
                                </button>
                            </div>
                            {error && <p className="text-red-400 text-xs mt-2 text-center font-inter">{error}</p>}
                        </div>
                    </motion.div>

                    {/* Middle Column: Display */}
                    <motion.div 
                        className="lg:col-span-5 h-full overflow-y-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <ChangelogDisplay changelog={selectedChangelog?.changelog || null} version={selectedChangelog?.version || 'v1.0.0'} />
                    </motion.div>

                    {/* Right Column: Chat */}
                    <motion.div 
                        className="lg:col-span-4 h-full"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <AriaChat 
                            currentChangelog={selectedChangelog?.changelog || null}
                            onSendMessage={handleAriaSendMessage}
                            chatHistory={chatHistory}
                            isEditing={isEditing}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Settings Modal */}
            <Settings
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onClose={() => setShowSettings(false)}
                isOpen={showSettings}
            />
        </div>
    );
};

export default MainApp; 