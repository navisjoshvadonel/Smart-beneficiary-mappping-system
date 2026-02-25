import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Bell, Search, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BasicDetailsModal } from './modals/BasicDetailsModal';

export const TopNav = () => {
    const { theme, toggleTheme } = useTheme();
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <>
            <header className="h-20 glass-panel border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-40 backdrop-blur-2xl">
                <div className="flex-1 flex items-center">
                    <div className="relative w-96 group text-text">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-textMuted group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-11 pr-10 py-2.5 glass-card bg-transparent border-white/20 text-text placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                            placeholder="/search query..."
                        />
                        {/* AI Hint Shimmer */}
                        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-accent-gradient scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left duration-500" />
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative p-2 text-textMuted hover:text-text transition-colors"
                    >
                        <Bell className="w-6 h-6" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className="p-2 text-textMuted hover:text-text transition-colors glow-ring rounded-full w-10 h-10 flex items-center justify-center"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                    </motion.button>

                    <div className="h-8 w-px bg-white/20 mx-2" />

                    <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setIsDetailsOpen(true)}>
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-text group-hover:text-indigo-400 transition-colors">
                                {(() => {
                                    try {
                                        const user = JSON.parse(localStorage.getItem('sbms_user'));
                                        return user ? user.full_name : 'Guest User';
                                    } catch {
                                        return 'Guest User';
                                    }
                                })()}
                            </p>
                            <p className="text-xs text-textMuted">
                                {(() => {
                                    try {
                                        const user = JSON.parse(localStorage.getItem('sbms_user'));
                                        return user ? user.email : 'guest@sbms.gov';
                                    } catch {
                                        return 'guest@sbms.gov';
                                    }
                                })()}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-gradient p-[2px] relative glow-ring">
                            <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                                <UserCircle className="w-8 h-8 text-textMuted" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <BasicDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} />
        </>
    );
};
