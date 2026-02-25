import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, Cpu, Users, BarChart } from 'lucide-react';
import { AdminAnalyticsSyncService } from '../services/api';

const defaultKPIs = [
    { label: 'Active Sessions', value: '0', icon: Activity, color: 'text-indigo-400', glow: 'shadow-[0_0_15px_rgba(129,140,248,0.5)]' },
    { label: 'Risk Anomalies', value: '0', icon: ShieldAlert, color: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(248,113,113,0.5)]' },
    { label: 'Total Applications', value: '0', icon: Cpu, color: 'text-teal-400', glow: 'shadow-[0_0_15px_rgba(45,212,191,0.5)]' },
    { label: 'Total Beneficiaries', value: '0', icon: Users, color: 'text-green-400', glow: 'shadow-[0_0_15px_rgba(74,222,128,0.5)]' },
];

export const AdminDashboard = () => {
    const [kpis, setKpis] = useState(defaultKPIs);
    const [allocations, setAllocations] = useState([]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await AdminAnalyticsSyncService.getMetrics();
                if (res.status === 'success' && res.data) {
                    const data = res.data;
                    setKpis([
                        { label: 'Total Users', value: data['Total Users']?.toString() || '0', icon: Users, color: 'text-indigo-400', glow: 'shadow-[0_0_15px_rgba(129,140,248,0.5)]' },
                        { label: 'Active Grievances', value: data['Active Grievances']?.toString() || '0', icon: ShieldAlert, color: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(248,113,113,0.5)]' },
                        { label: 'Tot Applications', value: data['Total Applications']?.toString() || '0', icon: Cpu, color: 'text-teal-400', glow: 'shadow-[0_0_15px_rgba(45,212,191,0.5)]' },
                        { label: 'Approval Rate', value: `${data['Approval Rate']}%`, icon: Activity, color: 'text-green-400', glow: 'shadow-[0_0_15px_rgba(74,222,128,0.5)]' },
                    ]);

                    const schemeHMap = data['Welfare Heatmap'] || [];
                    const formattedAllocations = schemeHMap.slice(0, 3).map((item, idx) => ({
                        name: item.scheme__scheme_name || 'Scheme',
                        val: item.count || 0,
                        color: idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-teal-500' : 'bg-purple-500',
                        text_color: idx === 0 ? 'text-indigo-400' : idx === 1 ? 'text-teal-400' : 'text-purple-400'
                    }));
                    setAllocations(formattedAllocations);
                }
            } catch (err) {
                console.error("Failed to sync metrics", err);
            }
        };
        fetchMetrics();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text flex items-center gap-3">
                        SBMS Global Command
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                        </span>
                    </h1>
                    <p className="text-textMuted font-mono text-sm mt-1">NODE: PRIMARY_ALPHA | STATUS: ACTIVE</p>
                </div>

                <div className="flex space-x-3">
                    <button className="glass-panel px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors border border-indigo-500/30">
                        Generate Intel Report
                    </button>
                </div>
            </div>

            {/* KPI Floating Tiles */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {kpis.map((kpi, index) => (
                    <motion.div
                        key={index}
                        variants={cardVariants}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className={`glass-card p-6 border-t border-l border-white/20 select-none overflow-hidden relative group`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium tracking-wider text-textMuted uppercase">{kpi.label}</p>
                            <div className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${kpi.glow}`}>
                                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 dark:from-white dark:to-gray-500">
                                {kpi.value}
                            </h3>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Welfare Allocation Heat Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 glass-card p-6 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-text">Welfare Allocation Heat Map</h3>
                        <BarChart className="w-5 h-5 text-textMuted" />
                    </div>

                    <div className="space-y-6">
                        {allocations.length > 0 ? allocations.map((alloc, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-textMuted font-mono truncate max-w-[70%]">{alloc.name}</span>
                                    <span className={`${alloc.text_color} font-bold`}>{alloc.val} Units</span>
                                </div>
                                <div className="w-full h-3 bg-card rounded-full overflow-hidden border border-white/5">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `100%` }} transition={{ duration: 1.5, delay: 0.5 + (i * 0.1) }} className={`h-full ${alloc.color}`} />
                                </div>
                            </div>
                        )) : (
                            <p className="text-textMuted italic">Awaiting pipeline sync...</p>
                        )}
                    </div>
                </motion.div>

                {/* Fraud Risk Meter Ring */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6 flex flex-col items-center justify-center border border-red-500/20 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-red-500/5 pulse-slow pointer-events-none" />

                    <h3 className="text-lg font-bold text-text mb-6 w-full text-center">Threat Assessment</h3>

                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="80" cy="80" r="70" className="stroke-card flex-none" strokeWidth="12" fill="none" />
                            <motion.circle
                                cx="80" cy="80" r="70"
                                className="stroke-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                                strokeWidth="12"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray="440"
                                initial={{ strokeDashoffset: 440 }}
                                animate={{ strokeDashoffset: 440 - (440 * 12) / 100 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-bold text-red-400">12%</span>
                            <span className="text-xs text-textMuted uppercase">Risk Level</span>
                        </div>
                    </div>

                    <p className="mt-6 text-sm text-textMuted text-center">
                        System detecting elevated anomaly rates in Node B.
                    </p>
                </motion.div>
            </div>

        </div>
    );
};
