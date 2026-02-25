import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { ProfileSyncService } from '../../services/api';

export const BasicDetailsModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = React.useState({
        full_name: 'Ramesh Kumar',
        dob: '1985-11-20',
        gender: 'Male',
        uid: '123412341234'
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await ProfileSyncService.updateProfile(formData);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    {/* Backdrop Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 pointer-events-auto"
                    >
                        <div className="glass-card shadow-2xl border border-white/20 overflow-hidden relative group">
                            {/* Header Ambient Glow */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-accent-gradient opacity-20 blur-[50px] pointer-events-none" />

                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-text">Verify Core Identity Details</h2>
                                    <button
                                        onClick={onClose}
                                        className="p-1 rounded-full text-textMuted hover:text-text hover:bg-white/10 transition-colors glow-ring"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-sm text-textMuted mb-6">
                                    Modifying these records invokes the DB validation protocol across 3 nodes.
                                </p>

                                <form className="space-y-5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider ml-1">UID (Aadhaar)</label>
                                        <input type="text" value={formData.uid} onChange={e => setFormData({ ...formData, uid: e.target.value })} className="w-full px-4 py-3 glass-panel border border-white/10 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-text" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider ml-1">Full Name</label>
                                        <input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-3 glass-panel border border-white/10 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-text" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-textMuted uppercase tracking-wider ml-1">DOB</label>
                                            <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full px-4 py-3 glass-panel border border-white/10 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-text [color-scheme:dark]" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-textMuted uppercase tracking-wider ml-1">Gender</label>
                                            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-3 glass-panel border border-white/10 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-text bg-transparent">
                                                <option className="bg-background text-text">Male</option>
                                                <option className="bg-background text-text">Female</option>
                                                <option className="bg-background text-text">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4 border-t border-white/10 mt-6">
                                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-textMuted hover:text-text transition-colors">Abort</button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="px-6 py-2 bg-accent-gradient rounded-xl font-medium text-white shadow-[0_0_15px_rgba(106,0,255,0.3)] flex items-center space-x-2 disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            <span>{isSubmitting ? 'Syncing...' : 'Commit Changes'}</span>
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </React.Fragment>
            )}
        </AnimatePresence>
    );
};
