import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Tag, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { CitizenService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const SchemeSearch = () => {
    const [query, setQuery] = useState('');
    const [stateFilter, setStateFilter] = useState('All States');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    // Unique values from dataset for quick dropdowns
    const statesList = ['All States', 'Tamil Nadu', 'Kerala', 'Karnataka', 'Maharashtra', 'Delhi', 'Gujarat', 'Central'];
    const typesList = ['All Types', 'Financial', 'Education', 'Healthcare', 'Housing', 'Agriculture', 'Disability', 'General'];

    useEffect(() => {
        const storedUser = localStorage.getItem('sbms_user');
        if (storedUser) {
            setUserId(JSON.parse(storedUser).id);
        }

        // Run initial empty search to load all
        handleSearch();
    }, []);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        try {
            const res = await CitizenService.searchSchemes(query, stateFilter, typeFilter);
            if (res.status === 'success') {
                setResults(res.schemes);
            }
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsLoading(false);
            setHasSearched(true);
        }
    };

    const handleApply = async (schemeId) => {
        if (!userId) {
            navigate('/');
            return;
        }
        try {
            const res = await CitizenService.applyScheme(userId, schemeId);
            if (res.status === 'success') {
                navigate('/dashboard'); // redirect back to dashboard after apply
            } else {
                alert(res.message);
            }
        } catch (err) {
            console.error("Failed to apply", err);
        }
    };


    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-3 mb-1">
                        <Database className="w-8 h-8 text-indigo-400" />
                        <h1 className="text-3xl font-bold text-text">Dataset Directory</h1>
                    </div>
                    <p className="text-textMuted text-sm">Query and explore 300+ government schemes natively</p>
                </div>
            </div>

            {/* Filter Bar */}
            <form onSubmit={handleSearch} className="glass-card p-4 border border-white/10 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search schemes by name, keyword, or intent..."
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500/50 focus:bg-white/10 transition-colors text-sm text-text outline-none placeholder-textMuted"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                        <select
                            value={stateFilter}
                            onChange={e => setStateFilter(e.target.value)}
                            className="w-full sm:w-auto pl-9 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-text focus:outline-none focus:border-indigo-500/50 appearance-none min-w-[150px] cursor-pointer"
                        >
                            {statesList.map(s => <option key={s} value={s} className="bg-background text-text">{s}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                            className="w-full sm:w-auto pl-9 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-text focus:outline-none focus:border-indigo-500/50 appearance-none min-w-[150px] cursor-pointer"
                        >
                            {typesList.map(t => <option key={t} value={t} className="bg-background text-text">{t}</option>)}
                        </select>
                    </div>

                    <button type="submit" className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Search Server'
                        )}
                    </button>
                </div>
            </form>

            {/* Results Grid */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </motion.div>
                ) : hasSearched && results.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="glass-card p-16 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10"
                    >
                        <ShieldCheck className="w-16 h-16 text-textMuted mb-4 opacity-70" />
                        <h3 className="text-xl font-bold text-text mb-2">No matching schemes</h3>
                        <p className="text-sm text-textMuted max-w-md">Try removing filters or using a broader search term.</p>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {results.map((scheme, idx) => (
                            <motion.div
                                key={scheme.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className="glass-card p-6 border border-white/10 hover:border-indigo-500/30 transition-colors group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold tracking-wider rounded-md uppercase">
                                                {scheme.benefit_type}
                                            </span>
                                            <span className="text-xs font-semibold text-textMuted flex items-center">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {scheme.state}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-text group-hover:text-indigo-400 transition-colors leading-tight">
                                            {scheme.name}
                                        </h3>
                                    </div>
                                </div>

                                <p className="text-sm text-textMuted mb-6 line-clamp-2 relative z-10">
                                    {scheme.description}
                                </p>

                                <div className="flex justify-between items-center relative z-10">
                                    <span className="text-xs font-mono text-textMuted/50">ID: {scheme.id}</span>
                                    <button
                                        onClick={() => handleApply(scheme.id)}
                                        className="px-5 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 rounded-xl text-sm font-medium transition-all group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center space-x-2"
                                    >
                                        <span>Quick Apply</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
