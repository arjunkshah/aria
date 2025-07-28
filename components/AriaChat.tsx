import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChatMessage, Changelog } from '../types';
import { SparklesIcon } from './Icons';

interface AriaChatProps {
    currentChangelog: Changelog | null;
    onSendMessage: (message: string, currentChangelog: Changelog) => Promise<void>;
    chatHistory: ChatMessage[];
    isEditing: boolean;
}

const AriaChat: React.FC<AriaChatProps> = ({ currentChangelog, onSendMessage, chatHistory, isEditing }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);


    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !currentChangelog || isEditing) return;
        
        const messageToSend = input;
        setInput('');
        await onSendMessage(messageToSend, currentChangelog);
    };

    return (
        <div className="bg-background-secondary rounded-2xl shadow-clay-inset w-full h-full flex flex-col p-4">
            <div className="flex-shrink-0 text-center border-b border-border pb-3 mb-4">
                <h3 className="text-xl font-bold text-text-strong flex items-center justify-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                    Aria
                </h3>
                <p className="text-sm text-text-secondary">Your AI Changelog Assistant</p>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {chatHistory.map((msg) => (
                    <motion.div 
                        key={msg.timestamp} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className={`px-4 py-2 rounded-xl max-w-xs lg:max-w-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-background text-text-primary rounded-bl-none shadow-clay'}`}>
                           <p className="text-sm leading-relaxed">{msg.parts[0].text}</p>
                        </div>
                    </motion.div>
                ))}
                {isEditing && (
                     <div className="flex justify-start">
                        <div className="px-4 py-2 rounded-xl bg-background text-text-primary shadow-clay rounded-bl-none flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex-shrink-0 mt-4">
                <fieldset disabled={!currentChangelog || isEditing}>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={currentChangelog ? "e.g., Make fixes more concise" : "Select a changelog first"}
                            className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                        />
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg shadow-clay hover:bg-primary/90 transition-all disabled:bg-background-secondary disabled:shadow-none disabled:cursor-not-allowed">
                            Send
                        </button>
                    </div>
                </fieldset>
            </form>
        </div>
    );
};

export default AriaChat;