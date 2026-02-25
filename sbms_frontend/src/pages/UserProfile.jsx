import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { CitizenService } from '../services/api';

export const UserProfile = () => {
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        dob: '',
        gender: '',
        income: '',
        occupation: '',
        education: '',
        disability_status: false,
        pension_status: false,
        state: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('sbms_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserId(user.id);
            fetchProfile(user.id);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchProfile = async (uid) => {
        try {
            const res = await CitizenService.getProfile(uid);
            if (res.status === 'success' && res.profile) {
                setFormData(res.profile);
            }
        } catch (error) {
            console.error("Profile fetch error", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSaving(true);
        if (!userId) return;

        try {
            const res = await CitizenService.updateProfile(userId, formData);
            if (res.status === 'success') {
                setMessage({ type: 'success', text: 'Profile updated successfully! Eligibility engines re-evaluated.' });
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            } else {
                setMessage({ type: 'error', text: res.message || 'Error saving profile.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Critical error communicating with the server.' });
        } finally {
            setIsSaving(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8 pb-12"
        >
            <div>
                <div className="flex items-center space-x-3 mb-2">
                    <User className="w-8 h-8 text-indigo-400" />
                    <h1 className="text-3xl font-bold text-text">Identity Profiling</h1>
                </div>
                <p className="text-textMuted text-sm">
                    Completing your demographic and socio-economic parameters accurately ensures that our deep mapping engine uncovers all beneficial schemes you are entitled to.
                </p>
            </div>

            {message.text && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-xl flex items-center space-x-3 backdrop-blur-md border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                    <span className="text-sm font-medium text-text">{message.text}</span>
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6">

                <h3 className="text-lg font-bold text-text border-b border-white/10 pb-2 mb-4">Demographics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 input-float-wrapper">
                        <label className="text-xs font-semibold text-textMuted bg-background absolute top-0 left-3 px-1 -translate-y-1/2 rounded z-10">Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-indigo-500/50 transition-colors relative z-0"
                            required
                        />
                    </div>

                    <div className="space-y-2 input-float-wrapper">
                        <label className="text-xs font-semibold text-textMuted bg-background absolute top-0 left-3 px-1 -translate-y-1/2 rounded z-10">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-indigo-500/50 transition-colors relative z-0 appearance-none"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Transgender">Transgender</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2 input-float-wrapper">
                        <label className="text-xs font-semibold text-textMuted bg-background absolute top-0 left-3 px-1 -translate-y-1/2 rounded z-10">State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="e.g., Delhi, Maharashtra"
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-indigo-500/50 transition-colors relative z-0"
                            required
                        />
                    </div>
                </div>

                <h3 className="text-lg font-bold text-text border-b border-white/10 pb-2 mt-8 mb-4">Socio-Economic Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 input-float-wrapper">
                        <label className="text-xs font-semibold text-textMuted bg-background absolute top-0 left-3 px-1 -translate-y-1/2 rounded z-10">Annual Income (₹)</label>
                        <input
                            type="number"
                            name="income"
                            value={formData.income}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-indigo-500/50 transition-colors relative z-0"
                            required
                        />
                    </div>

                    <div className="space-y-2 input-float-wrapper">
                        <label className="text-xs font-semibold text-textMuted bg-background absolute top-0 left-3 px-1 -translate-y-1/2 rounded z-10">Occupation Sector</label>
                        <select
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleChange}
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-indigo-500/50 transition-colors relative z-0 appearance-none"
                            required
                        >
                            <option value="">Select Sector</option>
                            <option value="Student">Student</option>
                            <option value="Farmer">Farmer</option>
                            <option value="Unemployed">Unemployed</option>
                            <option value="Business">Business</option>
                            <option value="Salaried">Salaried (Private/Govt)</option>
                            <option value="Worker">Laborer / Daily Wage</option>
                        </select>
                    </div>

                    <div className="space-y-2 input-float-wrapper md:col-span-2">
                        <label className="text-xs font-semibold text-textMuted bg-background absolute top-0 left-3 px-1 -translate-y-1/2 rounded z-10">Highest Education</label>
                        <select
                            name="education"
                            value={formData.education}
                            onChange={handleChange}
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-indigo-500/50 transition-colors relative z-0 appearance-none"
                            required
                        >
                            <option value="">Select Level</option>
                            <option value="Below 10th">Below 10th</option>
                            <option value="10th Pass">10th Pass</option>
                            <option value="12th Pass">12th Pass</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Graduate">Graduate</option>
                            <option value="Post Graduate">Post Graduate or Higher</option>
                        </select>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-text border-b border-white/10 pb-2 mt-8 mb-4">Special Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                name="disability_status"
                                checked={formData.disability_status}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-white/20 bg-transparent text-indigo-500 focus:ring-indigo-500 focus:ring-offset-background cursor-pointer"
                            />
                        </div>
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-text">Person with Disability (PwD)</span>
                            <span className="block text-xs text-textMuted mt-0.5">I possess a valid disability certificate.</span>
                        </div>
                    </label>

                    <label className="flex items-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                name="pension_status"
                                checked={formData.pension_status}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-white/20 bg-transparent text-indigo-500 focus:ring-indigo-500 focus:ring-offset-background cursor-pointer"
                            />
                        </div>
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-text">Pension Beneficiary</span>
                            <span className="block text-xs text-textMuted mt-0.5">I am currently receiving govt pension.</span>
                        </div>
                    </label>
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center space-x-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-medium rounded-xl shadow-[0_0_15px_rgba(106,0,255,0.4)] disabled:opacity-50 transition-all"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        <span>{isSaving ? 'Synchronizing...' : 'Save Profile Dynamics'}</span>
                    </button>
                </div>

            </form>
        </motion.div>
    );
};
