import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Grid, FileText, AlertCircle, RefreshCw, Search, ArrowRight, User } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CitizenService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const UserDashboard = () => {
    const [firstName, setFirstName] = useState('Citizen');
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        metrics: { eligible: 0, categories: 0, applications: 0, grievances: 0 },
        schemes: [],
        recent_applications: []
    });

    // Filtering State
    const [searchQuery, setSearchQuery] = useState('');
    const [stateFilter, setStateFilter] = useState('All States');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [filteredSchemes, setFilteredSchemes] = useState([]);

    // Derived unique options for dropdowns based on actual user eligible schemes
    const uniqueStates = ['All States', ...new Set(dashboardData.schemes.map(s => s.state).filter(Boolean))];
    const uniqueTypes = ['All Types', ...new Set(dashboardData.schemes.map(s => s.category).filter(Boolean))];

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('sbms_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setFirstName(user.full_name?.split(' ')[0] || 'Citizen');
            setUserId(user.id);
            fetchDashboardData(user.id);
        }
    }, []);

    const fetchDashboardData = async (uid) => {
        setIsLoading(true);
        try {
            const res = await CitizenService.getDashboardData(uid);
            if (res.status === 'success') {
                setDashboardData({
                    metrics: res.metrics,
                    schemes: res.schemes,
                    recent_applications: res.recent_applications
                });
                setFilteredSchemes(res.schemes); // Initialize filter with all
            }
        } catch (error) {
            console.error("Dashboard fetch error", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter Logic
    useEffect(() => {
        let result = dashboardData.schemes;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(q) ||
                (s.category || '').toLowerCase().includes(q)
            );
        }

        if (stateFilter !== 'All States') {
            result = result.filter(s => s.state === stateFilter);
        }

        if (typeFilter !== 'All Types') {
            result = result.filter(s => s.category === typeFilter);
        }

        setFilteredSchemes(result);
    }, [searchQuery, stateFilter, typeFilter, dashboardData.schemes]);

    const handleApply = async (schemeId) => {
        if (!userId) return;
        try {
            const res = await CitizenService.applyScheme(userId, schemeId);
            if (res.status === 'success') {
                fetchDashboardData(userId); // Re-fetch to update apps and metrics
            } else {
                alert(res.message);
            }
        } catch (err) {
            console.error("Failed to apply", err);
        }
    };
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
        <div className="space-y-8 max-w-7xl mx-auto pb-12">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-3 mb-1">
                        <h1 className="text-3xl font-bold text-text">Hello, {firstName}</h1>
                        <span className="text-2xl animate-wave origin-bottom-right">👋</span>
                    </div>
                    <p className="text-textMuted text-sm">Here's your benefit eligibility overview</p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => userId && fetchDashboardData(userId)}
                        disabled={isLoading}
                        className="glass-panel px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors flex items-center space-x-2 border border-white/20 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Re-check Eligibility</span>
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        className="bg-accent-gradient px-4 py-2 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(106,0,255,0.3)] hover:shadow-[0_0_20px_rgba(106,0,255,0.5)] transition-shadow flex items-center space-x-2 text-white border border-white/10"
                    >
                        <User className="w-4 h-4" />
                        <span>Update Profile</span>
                    </button>
                </div>
            </div>

            {/* KPI Summary Row */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <motion.div variants={cardVariants} className="glass-card p-6 border-t border-l border-white/20 flex items-center space-x-4 group hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {dashboardData.metrics.eligible}
                        </h3>
                        <p className="text-xs font-semibold text-textMuted uppercase tracking-wider">Eligible</p>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} className="glass-card p-6 border-t border-l border-white/20 flex items-center space-x-4 group hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <Grid className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {dashboardData.metrics.categories}
                        </h3>
                        <p className="text-xs font-semibold text-textMuted uppercase tracking-wider">Categories</p>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} className="glass-card p-6 border-t border-l border-white/20 flex items-center space-x-4 group hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {dashboardData.metrics.applications}
                        </h3>
                        <p className="text-xs font-semibold text-textMuted uppercase tracking-wider">Applications</p>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} className="glass-card p-6 border-t border-l border-white/20 flex items-center space-x-4 group hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {dashboardData.metrics.grievances}
                        </h3>
                        <p className="text-xs font-semibold text-textMuted uppercase tracking-wider">Grievances</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Filter Bar */}
            <div className="glass-card p-2 border border-white/10 flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search eligible schemes..."
                        className="w-full pl-9 pr-4 py-3 bg-transparent border border-white/5 rounded-xl focus:border-indigo-500/50 focus:bg-white/5 transition-colors text-sm text-text outline-none"
                    />
                </div>
                <div className="flex gap-2 flex-wrap md:flex-nowrap">
                    <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="flex-1 md:flex-none px-4 py-3 bg-transparent border border-white/10 rounded-xl text-sm text-text focus:outline-none focus:border-indigo-500/50 appearance-none min-w-[140px] cursor-pointer"
                    >
                        {uniqueStates.map(state => (
                            <option key={state} value={state} className="bg-background text-text">{state}</option>
                        ))}
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="flex-1 md:flex-none px-4 py-3 bg-transparent border border-white/10 rounded-xl text-sm text-text focus:outline-none focus:border-indigo-500/50 appearance-none min-w-[140px] cursor-pointer"
                    >
                        {uniqueTypes.map(type => (
                            <option key={type} value={type} className="bg-background text-text">{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Eligible Schemes (Left Col - spanning 2) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-lg font-bold text-text">Eligible Schemes</h2>
                        </div>
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
                            {filteredSchemes.length} MATCHES
                        </span>
                    </div>

                    <AnimatePresence>
                        {filteredSchemes.length === 0 && !isLoading ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="glass-card p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 mt-2"
                            >
                                <div className="w-16 h-16 mb-4 glass-panel rounded-2xl flex items-center justify-center opacity-70">
                                    <svg className="w-8 h-8 text-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-text mb-1">No eligible schemes found</h3>
                                <p className="text-sm text-textMuted mb-6 max-w-sm">
                                    Adjust your filters or complete more profiling.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {filteredSchemes.map((scheme, idx) => (
                                    <motion.div
                                        key={scheme.id}
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
                                                    onClick={() => handleApply(scheme.id)}
                                                    className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 rounded-xl text-sm font-medium transition-colors flex items-center space-x-1"
                                                >
                                                    <span>Apply</span>
                                                    <ArrowRight className="w-4 h-4 ml-1" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar (Right Col) */}
                <div className="space-y-6">
                    {/* Applications Snippet */}
                    <div className="glass-card p-5 border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />

                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-indigo-400" />
                                <h3 className="font-bold text-text">Applications</h3>
                            </div>
                            <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium tracking-wide">View All</a>
                        </div>

                        <div className="space-y-3 relative z-10">
                            {dashboardData.recent_applications.length === 0 ? (
                                <p className="text-xs text-textMuted px-1">No applications pending.</p>
                            ) : (
                                dashboardData.recent_applications.map(app => (
                                    <div key={app.id} className="flex flex-col space-y-2 p-3 bg-white/5 rounded-xl border border-white/5 mx-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-semibold text-text leading-tight">{app.name}</h4>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-textMuted">{app.appliedOn}</span>
                                            <span className={`px-2 py-0.5 border text-[10px] font-bold tracking-wider rounded-md ${app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                app.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    app.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-white/10 text-textMuted border-white/10'
                                                }`}>
                                                {app.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Profile Strength Snippet */}
                    <div className="glass-card p-5 border border-white/10 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-emerald-400" />
                                <h3 className="font-bold text-text">Profile Strength</h3>
                            </div>
                        </div>
                        <div className="h-40 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="70%"
                                    outerRadius="90%"
                                    barSize={12}
                                    data={[{ name: 'Profile', value: 85, fill: '#10b981' }]}
                                    startAngle={225}
                                    endAngle={-45}
                                >
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={6} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-text">85%</span>
                                <span className="text-[10px] text-textMuted uppercase tracking-wider">Complete</span>
                            </div>
                        </div>
                        <p className="text-xs text-textMuted text-center mt-2">
                            Add income certificates to unlock 12 more schemes.
                        </p>
                    </div>

                    {/* Past Searches Snippet */}
                    <div className="glass-card p-5 border border-white/10">
                        <div className="flex items-center space-x-2 mb-4">
                            <svg className="w-4 h-4 text-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="font-bold text-text">Past Searches</h3>
                        </div>

                        <div className="py-8 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                            <p className="text-xs text-textMuted">No past searches.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
