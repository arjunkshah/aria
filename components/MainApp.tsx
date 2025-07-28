import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chat } from "@google/genai";
import { Repo, HistoricalChangelog, AppStatus, ChatMessage, Changelog } from '../types';
import { generateChangelogFromPRs, createAriaChat } from '../services/geminiService';
import { getMergedPRs, parseRepoUrl } from '../services/githubService';
import ConnectRepo from './ConnectRepo';
import ChangelogDisplay from './ChangelogDisplay';
import AriaChat from './AriaChat';
import { BookOpenIcon, ZapIcon, ArrowPathIcon } from './Icons';

const MainApp: React.FC = () => {
    const [status, setStatus] = useState<AppStatus>('initial');
    const [error, setError] = useState<string | null>(null);
    
    const [repo, setRepo] = useState<Repo | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const [historicalChangelogs, setHistoricalChangelogs] = useState<HistoricalChangelog[]>([]);
    const [selectedChangelog, setSelectedChangelog] = useState<HistoricalChangelog | null>(null);
    const [newVersion, setNewVersion] = useState('v1.0.0');

    const [ariaChat, setAriaChat] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const savedRepo = localStorage.getItem('repo');
        const savedToken = localStorage.getItem('token');
        const savedHistory = localStorage.getItem('changelogHistory');

        if (savedRepo && savedToken) {
            const parsedRepo = JSON.parse(savedRepo);
            setRepo(parsedRepo);
            setToken(savedToken);
            if (savedHistory) {
                const history = JSON.parse(savedHistory);
                setHistoricalChangelogs(history);
                if(history.length > 0) {
                    setSelectedChangelog(history[0]);
                }
            }
            setStatus('ready');
        }
        setAriaChat(createAriaChat());
    }, []);

    const saveState = (key: string, value: any) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const handleConnect = async (repoUrl: string, pat: string) => {
        setStatus('loading');
        setError(null);
        try {
            const parsedRepo = parseRepoUrl(repoUrl);
            setRepo(parsedRepo);
            setToken(pat);
            setStatus('ready');
            localStorage.setItem('repo', JSON.stringify(parsedRepo));
            localStorage.setItem('token', pat);
            // Reset history for new repo
            setHistoricalChangelogs([]);
            setSelectedChangelog(null);
            localStorage.removeItem('changelogHistory');
        } catch (e) {
            const err = e as Error;
            setError(err.message);
            setStatus('error');
        }
    };

    const handleGenerate = async () => {
        if (!repo || !token) return;
        setStatus('loading');
        setError(null);
        try {
            const lastGeneratedDate = historicalChangelogs[0]?.date;
            const prs = await getMergedPRs(repo, token, lastGeneratedDate);
            
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
            };
            
            const updatedHistory = [newEntry, ...historicalChangelogs];
            setHistoricalChangelogs(updatedHistory);
            setSelectedChangelog(newEntry);
            saveState('changelogHistory', updatedHistory);
            setStatus('ready');

        } catch (e) {
            const err = e as Error;
            console.error(err);
            setError(`Failed to generate: ${err.message}`);
            setStatus('ready');
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
            
            const updatedHistory = historicalChangelogs.map(h => h.id === selectedChangelog.id ? updatedEntry : h);

            setHistoricalChangelogs(updatedHistory);
            setSelectedChangelog(updatedEntry);
            saveState('changelogHistory', updatedHistory);
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

    if (!repo || !token) {
        return <ConnectRepo onConnect={handleConnect} loading={status === 'loading'} />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-150px)]">
            {/* Left Column: History */}
            <motion.div 
                className="lg:col-span-3 bg-background-secondary rounded-2xl p-4 shadow-clay-inset border border-border flex flex-col"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="flex-shrink-0 border-b border-border pb-3 mb-3">
                     <h2 className="text-lg font-bold text-text-strong flex items-center gap-2"><BookOpenIcon className="w-5 h-5"/>Changelog History</h2>
                     <p className="text-xs text-text-secondary">{repo.owner}/{repo.name}</p>
                </div>
                <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                    {historicalChangelogs.map(h => (
                        <motion.button 
                            key={h.id} 
                            onClick={() => setSelectedChangelog(h)} 
                            className={`w-full text-left p-3 rounded-lg transition-all ${selectedChangelog?.id === h.id ? 'bg-primary/20 text-text-strong' : 'hover:bg-background/50 text-text-primary'}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <p className="font-bold">{h.version}</p>
                            <p className="text-xs text-text-secondary">{new Date(h.date).toLocaleDateString()}</p>
                        </motion.button>
                    ))}
                </div>
                <div className="flex-shrink-0 pt-4 border-t border-border">
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={newVersion}
                            onChange={(e) => setNewVersion(e.target.value)}
                            placeholder="New version (e.g. v1.2.4)"
                            className="w-full bg-background border border-border text-text-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                         <button
                            onClick={handleGenerate}
                            disabled={status === 'loading'}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 font-bold bg-primary text-white rounded-lg shadow-clay hover:bg-primary/90 transition-all disabled:bg-background-secondary disabled:text-text-secondary disabled:shadow-none disabled:cursor-not-allowed"
                         >
                            {status === 'loading' && <ArrowPathIcon className="w-5 h-5 animate-spin"/>}
                            {status === 'loading' ? 'Checking for PRs...' : <><ZapIcon className="w-5 h-5" /> Generate New</>}
                        </button>
                    </div>
                     {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
                </div>
            </motion.div>

            {/* Middle Column: Display */}
            <motion.div 
                className="lg:col-span-5 h-full overflow-y-auto pr-2"
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
    );
};

export default MainApp;