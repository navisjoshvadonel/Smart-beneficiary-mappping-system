import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, CheckCircle, AlertCircle, ShieldCheck, Clock } from 'lucide-react';
import { AdminAnalyticsSyncService } from '../services/api';

export const AdminGrievances = () => {
    const [grievances, setGrievances] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const fetchGrievances = async () => {
        setIsLoading(true);
        try {
            const res = await AdminAnalyticsSyncService.getGrievances();
            if (res.status === 'success') {
                setGrievances(res.grievances);
            }
        } catch (error) {
            console.error("Failed to fetch admin grievances", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGrievances();
    }, []);

    const handleResolve = async (id, rawId) => {
        setActionLoadingId(id);
        try {
            const res = await AdminAnalyticsSyncService.resolveGrievance(rawId);
            if (res.status === 'success') {
                setGrievances(prev => prev.map(g =>
                    g.id === id ? { ...g, status: 'Resolved' } : g
                ));
            } else {
                alert(res.message || 'Failed to resolve grievance');
            }
        } catch (error) {
            console.error("Resolve error", error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const isEmpty = grievances.length === 0 && !isLoading;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-3 mb-1">
                        <Inbox className="w-8 h-8 text-indigo-400" />
                        <h1 className="text-3xl font-bold text-text">Platform Grievances</h1>
                    </div>
                    <p className="text-textMuted text-sm font-mono mt-1">
                        NODE: OMEGA_RESOLVE | TRACKING ACTIVE ISSUES
                    </p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={fetchGrievances}
                        className="glass-panel px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors border border-indigo-500/30 flex items-center space-x-2"
                    >
                        <Clock className="w-4 h-4" />
                        <span>Refresh Log</span>
                    </button>
                </div>
            </div>

            {/* Grievance Content */}
            <AnimatePresence>
                {isLoading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </motion.div>
                ) : isEmpty ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="glass-card p-16 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10"
                    >
                        <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4 opacity-70 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        <h3 className="text-xl font-bold text-text mb-2">No Active Grievances</h3>
                        <p className="text-sm text-textMuted max-w-md">
                            All citizen reports have been resolved. The network is operating nominally.
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4 pt-4">
                        {grievances.map((g, idx) => (
                            <motion.div
                                key={g.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`glass-card p-6 border-l-4 ${g.status === 'Open'
                                        ? 'border-l-red-500 border-t border-r border-b border-white/10 hover:border-red-500/30'
                                        : 'border-l-emerald-500 border-t border-r border-b border-white/10 opacity-75 hover:opacity-100 hover:border-emerald-500/30'
                                    } transition-all`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h4 className="font-bold text-text text-lg">{g.id}</h4>
                                            <span className={`px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-md uppercase border ${g.status === 'Open'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>
                                                {g.status}
                                            </span>
                                        </div>
                                        <div className="text-xs font-mono text-textMuted/70">
                                            User: {g.user} • Reported: {g.raisedOn}
                                        </div>
                                    </div>

                                    {g.status === 'Open' ? (
                                        <button
                                            onClick={() => handleResolve(g.id, g.raw_id)}
                                            disabled={actionLoadingId === g.id}
                                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white rounded-xl text-sm font-medium transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center space-x-2"
                                        >
                                            {actionLoadingId === g.id ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            <span>Mark Resolved</span>
                                        </button>
                                    ) : (
                                        <div className="flex items-center space-x-1 text-emerald-500 text-sm font-medium">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Resolved</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-text bg-white/5 p-4 rounded-lg border border-white/5 whitespace-pre-wrap font-sans">
                                    {g.complaint}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
