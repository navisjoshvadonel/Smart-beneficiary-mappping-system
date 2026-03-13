import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Grid, FileText, AlertCircle, RefreshCw, Search, User } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CitizenService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Modular Components
import { MetricCard } from '../components/dashboard/MetricCard';
import { SchemeMatchCard } from '../components/dashboard/SchemeMatchCard';
import { ApplicationSnippet } from '../components/dashboard/ApplicationSnippet';
import { SmartScanOverlay } from '../components/SmartScanOverlay';

export const UserDashboard = () => {
    const [firstName, setFirstName] = useState('Citizen');
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showScan, setShowScan] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        metrics: { eligible: 0, categories: 0, applications: 0, grievances: 0 },
        schemes: [],
        recent_applications: []
    });

    // Filtering State
    const [searchQuery, setSearchQuery] = useState('');
    const [strengthData, setStrengthData] = useState({ strength: 0, tips: [] });
    const [stateFilter, setStateFilter] = useState('All States');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [filteredSchemes, setFilteredSchemes] = useState([]);

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
        const loadingToast = toast.loading('Checking eligibility...');
        try {
            const res = await CitizenService.getDashboardData(uid);
            if (res.status === 'success') {
                setDashboardData({
                    metrics: res.metrics,
                    schemes: res.schemes,
                    recent_applications: res.recent_applications
                });
                setFilteredSchemes(res.schemes);
                
                // Fetch strength
                const sRes = await CitizenService.getProfileStrength(uid);
                if (sRes.status === 'success') {
                    setStrengthData({ strength: sRes.strength, tips: sRes.tips });
                }

                toast.success('Dashboard updated', { id: loadingToast });
            }
        } catch (error) {
            console.error("Dashboard fetch error", error);
            toast.error('Failed to update dashboard', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let result = dashboardData.schemes;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(q) ||
                (s.category || '').toLowerCase().includes(q)
            );
        }
        if (stateFilter !== 'All States') result = result.filter(s => s.state === stateFilter);
        if (typeFilter !== 'All Types') result = result.filter(s => s.category === typeFilter);
        setFilteredSchemes(result);
    }, [searchQuery, stateFilter, typeFilter, dashboardData.schemes]);

    const handleApply = async (schemeId) => {
        if (!userId) return;
        const applyToast = toast.loading('Submitting application...');
        try {
            const res = await CitizenService.applyScheme(userId, schemeId);
            if (res.status === 'success') {
                toast.success('Application submitted successfully!', { id: applyToast });
                fetchDashboardData(userId);
            } else {
                toast.error(res.message, { id: applyToast });
            }
        } catch (err) {
            console.error("Failed to apply", err);
            toast.error('System error occurred', { id: applyToast });
        }
    };

    const uniqueStates = ['All States', ...new Set(dashboardData.schemes.map(s => s.state).filter(Boolean))];
    const uniqueTypes = ['All Types', ...new Set(dashboardData.schemes.map(s => s.category).filter(Boolean))];

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard icon={ShieldCheck} value={dashboardData.metrics.eligible} label="Eligible" colorClass="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" delay={0.1} />
                <MetricCard icon={Grid} value={dashboardData.metrics.categories} label="Categories" colorClass="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400" delay={0.2} />
                <MetricCard icon={FileText} value={dashboardData.metrics.applications} label="Applications" colorClass="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400" delay={0.3} />
                <MetricCard icon={AlertCircle} value={dashboardData.metrics.grievances} label="Grievances" colorClass="bg-amber-500/10 border border-amber-500/20 text-amber-400" delay={0.4} />
            </div>

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
                    <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="flex-1 md:flex-none px-4 py-3 bg-transparent border border-white/10 rounded-xl text-sm text-text focus:outline-none focus:border-indigo-500/50 appearance-none min-w-[140px] cursor-pointer">
                        {uniqueStates.map(state => <option key={state} value={state} className="bg-background text-text">{state}</option>)}
                    </select>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="flex-1 md:flex-none px-4 py-3 bg-transparent border border-white/10 rounded-xl text-sm text-text focus:outline-none focus:border-indigo-500/50 appearance-none min-w-[140px] cursor-pointer">
                        {uniqueTypes.map(type => <option key={type} value={type} className="bg-background text-text">{type}</option>)}
                    </select>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 mt-2">
                                <div className="w-16 h-16 mb-4 glass-panel rounded-2xl flex items-center justify-center opacity-70">
                                    <FileText className="w-8 h-8 text-textMuted" />
                                </div>
                                <h3 className="text-lg font-bold text-text mb-1">No eligible schemes found</h3>
                                <p className="text-sm text-textMuted mb-6 max-w-sm">Adjust your filters or complete more profiling.</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {filteredSchemes.map((scheme, idx) => (
                                    <SchemeMatchCard key={scheme.id} scheme={scheme} onApply={handleApply} idx={idx} />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-6">
                    <ApplicationSnippet applications={dashboardData.recent_applications} />

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
                                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" barSize={12} data={[{ name: 'Profile', value: strengthData.strength, fill: strengthData.strength > 70 ? '#10b981' : '#f59e0b' }]} startAngle={225} endAngle={-45}>
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={6} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-text">{strengthData.strength}%</span>
                                <span className="text-[10px] text-textMuted uppercase tracking-wider">Complete</span>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            {strengthData.tips.map((tip, i) => (
                                <p key={i} className="text-[10px] text-textMuted flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                                    {tip}
                                </p>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-5 border border-white/10">
                        <div className="flex items-center space-x-2 mb-4">
                            <RefreshCw className="w-4 h-4 text-textMuted" />
                            <h3 className="font-bold text-text">Past Searches</h3>
                        </div>
                        <div className="py-8 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                            <p className="text-xs text-textMuted">No past searches.</p>
                        </div>
                    </div>
                </div>
            </div>
            {showScan && <SmartScanOverlay onComplete={() => setShowScan(false)} />}
        </div>
    );
};
