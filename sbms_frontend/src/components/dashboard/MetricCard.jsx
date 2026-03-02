import React from 'react';
import { motion } from 'framer-motion';

export const MetricCard = ({ icon: Icon, value, label, colorClass, delay = 0 }) => {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay }}
            className="glass-card p-6 border-t border-l border-white/20 flex items-center space-x-4 group hover:-translate-y-1 transition-transform"
        >
            <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {value}
                </h3>
                <p className="text-xs font-semibold text-textMuted uppercase tracking-wider">{label}</p>
            </div>
        </motion.div>
    );
};
