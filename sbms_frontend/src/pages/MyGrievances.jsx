import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Plus, X } from 'lucide-react';
import { CitizenService } from '../services/api';

export const MyGrievances = () => {
    const [grievances, setGrievances] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [complaintText, setComplaintText] = useState('');
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchGrievances = async (uid) => {
        setIsLoading(true);
        try {
            const res = await CitizenService.getGrievances(uid);
            if (res.status === 'success') {
                setGrievances(res.grievances);
            }
        } catch (error) {
            console.error("Failed to fetch grievances", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('sbms_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserId(user.id);
            fetchGrievances(user.id);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!complaintText.trim()) return;
        setIsSubmitting(true);

        try {
            const res = await CitizenService.submitGrievance(userId, complaintText);
            if (res.status === 'success') {
                setIsModalOpen(false);
                setComplaintText('');
                fetchGrievances(userId); // reload
            }
        } catch (error) {
            console.error("Failed to submit grievance", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    const isEmpty = () => grievances.length === 0 && !isLoading;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-2 text-textMuted mb-2">
                        <span className="text-sm cursor-pointer hover:text-text transition-colors">← Back to Dashboard</span>
                    </motion.div>
                    <div className="flex items-center space-x-3 mb-1">
                        <AlertCircle className="w-8 h-8 text-amber-500" />
                        <h1 className="text-3xl font-bold text-text">My Grievances</h1>
                    </div>
                    <p className="text-textMuted text-sm">Track all grievances you've raised and their resolutions</p>
                </div>

                <div className="flex space-x-3">
                    <button onClick={() => setIsModalOpen(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>New Grievance</span>
                    </button>
                </div>
            </div>

            {/* Grievance Content */}
            <AnimatePresence>
                {isEmpty() ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="glass-card p-16 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10"
                    >
                        <div className="w-20 h-20 mb-6 rounded-full border border-white/20 bg-white/5 flex items-center justify-center overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                            <svg className="w-10 h-10 text-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h3 className="text-xl font-bold text-text mb-2">No grievances raised</h3>
                        <p className="text-sm text-textMuted mb-8 max-w-md">
                            You haven't reported any issues with your applications or schemes.
                        </p>

                        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                            Submit a Grievance
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-4 pt-4">
                        {grievances.map((g, idx) => (
                            <motion.div
                                key={g.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card p-6 border-l-4 border-l-indigo-500 border-t border-r border-b border-white/10"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-text text-lg">{g.id}</h4>
                                    <span className={`px-3 py-1 text-xs font-bold tracking-wider rounded-full border ${g.status === 'Open' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        }`}>
                                        {g.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-textMuted mb-4 whitespace-pre-wrap">{g.complaint}</p>
                                <div className="text-xs text-textMuted font-medium">
                                    Reported: {g.raisedOn}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f111a] border border-white/10 p-6 rounded-2xl w-full max-w-lg relative z-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-text flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-indigo-400" />
                                    Submit a New Grievance
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-textMuted hover:text-text transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-textMuted mb-2 tracking-wider">COMPLAINT DETAILS</label>
                                    <textarea
                                        rows="5"
                                        required
                                        value={complaintText}
                                        onChange={e => setComplaintText(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-text focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder-textMuted"
                                        placeholder="Please describe the issue with your application or scheme processing in detail..."
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 text-sm font-medium text-textMuted hover:text-text transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 ml-2"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};
