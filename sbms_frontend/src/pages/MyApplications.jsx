import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { CitizenService } from '../services/api';

export const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [metrics, setMetrics] = useState([
        { label: 'TOTAL APPLIED', value: '0', icon: FileText, color: 'text-indigo-400' },
        { label: 'PENDING REVIEW', value: '0', icon: Clock, color: 'text-amber-400' },
        { label: 'APPROVED', value: '0', icon: CheckCircle, color: 'text-emerald-400' },
        { label: 'REJECTED', value: '0', icon: XCircle, color: 'text-red-400' }
    ]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            const storedUser = localStorage.getItem('sbms_user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                try {
                    const res = await CitizenService.getApplications(user.id);
                    if (res.status === 'success') {
                        setApplications(res.applications);

                        // Recalculate metrics
                        const total = res.applications.length;
                        const pending = res.applications.filter(a => a.status === 'Pending').length;
                        const approved = res.applications.filter(a => a.status === 'Approved').length;
                        const rejected = res.applications.filter(a => a.status === 'Rejected').length;

                        setMetrics([
                            { label: 'TOTAL APPLIED', value: total.toString(), icon: FileText, color: 'text-indigo-400' },
                            { label: 'PENDING REVIEW', value: pending.toString(), icon: Clock, color: 'text-amber-400' },
                            { label: 'APPROVED', value: approved.toString(), icon: CheckCircle, color: 'text-emerald-400' },
                            { label: 'REJECTED', value: rejected.toString(), icon: XCircle, color: 'text-red-400' }
                        ]);
                    }
                } catch (error) {
                    console.error("Failed to fetch applications", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchApps();
    }, []);
    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">

            {/* Header */}
            <div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-2 text-textMuted mb-2">
                    <span className="text-sm cursor-pointer hover:text-text transition-colors">← Back to Dashboard</span>
                </motion.div>
                <div className="flex items-center space-x-3 mb-1">
                    <FileText className="w-8 h-8 text-emerald-500" />
                    <h1 className="text-3xl font-bold text-text">My Applications</h1>
                </div>
                <p className="text-textMuted text-sm">Track all your scheme applications and their current status</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {metrics.map((metric, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        className="glass-card p-6 border-t border-l border-white/20 hover:-translate-y-1 transition-transform relative overflow-hidden"
                    >
                        {/* Status specific glow */}
                        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-10 ${metric.color.replace('text-', 'bg-')}`} />

                        <h3 className={`text-4xl font-bold mb-2 ${metric.color === 'text-amber-400' ? 'text-amber-400' : metric.color === 'text-emerald-400' ? 'text-emerald-400' : metric.color === 'text-red-400' ? 'text-red-400' : 'text-text'}`}>
                            {metric.value}
                        </h3>
                        <p className="text-xs font-bold text-textMuted uppercase tracking-wider">{metric.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Data Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card border border-white/10 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-xs font-bold text-textMuted uppercase tracking-wider">
                                <th className="p-4 px-6 whitespace-nowrap">Reference ID</th>
                                <th className="p-4 px-6 whitespace-nowrap">Scheme Name</th>
                                <th className="p-4 px-6 whitespace-nowrap">Category</th>
                                <th className="p-4 px-6 whitespace-nowrap">Applied On</th>
                                <th className="p-4 px-6 whitespace-nowrap">Status</th>
                                <th className="p-4 px-6 whitespace-nowrap text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {applications.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-textMuted text-sm">
                                            No applications filed yet. Head to the Dashboard to begin searching profiles.
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map((app, idx) => (
                                        <motion.tr
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                            key={idx} className="hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="p-4 px-6">
                                                <span className="text-sm font-bold text-indigo-400">{app.id}</span>
                                            </td>
                                            <td className="p-4 px-6">
                                                <span className="text-sm font-bold text-text">{app.name}</span>
                                            </td>
                                            <td className="p-4 px-6">
                                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium rounded-md">
                                                    {app.category}
                                                </span>
                                            </td>
                                            <td className="p-4 px-6">
                                                <span className="text-sm text-textMuted">{app.appliedOn}</span>
                                            </td>
                                            <td className="p-4 px-6">
                                                <span className={`px-4 py-1 border text-xs font-bold tracking-wider rounded-full flex w-max items-center space-x-2 ${app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        app.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                            app.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                'bg-white/10 text-textMuted border-white/20'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'Approved' ? 'bg-emerald-400' : app.status === 'Pending' ? 'bg-amber-400' : app.status === 'Rejected' ? 'bg-red-500' : 'bg-textMuted'}`} />
                                                    <span>{app.status.toUpperCase()}</span>
                                                </span>
                                            </td>
                                            <td className="p-4 px-6 text-right">
                                                <button className="px-4 py-1.5 border border-indigo-400/30 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-full text-sm font-medium transition-colors inline-flex items-center space-x-1">
                                                    <span>Guide</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

        </div>
    );
};
