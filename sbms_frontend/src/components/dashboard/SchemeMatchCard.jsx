import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const SchemeMatchCard = ({ scheme, onApply, idx }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-5 border border-white/10 hover:border-indigo-500/30 transition-colors group relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="ml-2">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-0.5 bg-white/5 text-textMuted border border-white/10 text-[10px] font-bold tracking-wider rounded">
                            {(scheme.category || 'General').toUpperCase()}
                        </span>
                        <span className="text-xs text-textMuted">{scheme.state || 'N/A'}</span>
                    </div>
                    <h3 className="text-lg font-bold text-text group-hover:text-indigo-400 transition-colors">{scheme.name}</h3>
                </div>
                <div className="flex space-x-2 shrink-0 ml-2">
                    <button
                        onClick={() => window.open(scheme.link, '_blank')}
                        className="px-4 py-2 border border-white/10 text-text hover:bg-white/5 rounded-xl text-sm font-medium transition-colors"
                    >
                        Details
                    </button>
                    <button
                        onClick={() => onApply(scheme.id)}
                        className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 rounded-xl text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                        <span>Apply</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
