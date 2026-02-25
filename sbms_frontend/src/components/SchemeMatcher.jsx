import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, Database, ShieldAlert, Check } from 'lucide-react';

export const SchemeMatcher = ({ isScanning, scanResult, onReset }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isScanning) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + Math.floor(Math.random() * 5) + 1;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isScanning]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card overflow-hidden relative"
        >
            {/* Rotating neon border logic (simplified via CSS gradient rotation trick) */}
            <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(0,240,255,1)_360deg)] animate-[spin_3s_linear_infinite] opacity-50" />
            <div className="absolute inset-[2px] bg-card backdrop-blur-2xl rounded-2xl z-10" />

            <div className="p-8 lg:p-12 relative z-20 w-full h-full min-h-[400px] flex flex-col items-center justify-center space-y-8">

                {isScanning ? (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="relative w-32 h-32 flex items-center justify-center"
                        >
                            <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full" />
                            <div className="absolute inset-0 border-4 border-transparent border-t-indigo-400 rounded-full" />
                            <div className="absolute inset-4 border-4 border-teal-500/30 rounded-full" />
                            <div className="absolute inset-4 border-4 border-transparent border-b-teal-400 rounded-full" />
                            <h2 className="text-3xl font-bold text-text tabular-nums">{Math.min(minAmount(progress), 100)}%</h2>
                        </motion.div>

                        <div className="space-y-4 text-center w-full">
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-accent-gradient animate-pulse">
                                Querying National Database...
                            </h3>

                            <div className="space-y-2 text-sm text-textMuted text-left max-w-sm mx-auto font-mono">
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: progress > 10 ? 1 : 0 }} className="flex items-center space-x-2">
                                    <Database className="w-4 h-4 text-indigo-400" /> <span>Cross-referencing demographic tables...</span>
                                </motion.div>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: progress > 40 ? 1 : 0 }} className="flex items-center space-x-2">
                                    <ShieldAlert className="w-4 h-4 text-yellow-500" /> <span>Validating income brackets...</span>
                                </motion.div>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: progress > 70 ? 1 : 0 }} className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" /> <span>Applying NLP Eligibility Rules...</span>
                                </motion.div>
                            </div>

                            {/* Progress shimmer sweep */}
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative mt-8">
                                <motion.div
                                    className="absolute left-0 top-0 h-full bg-accent-gradient"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        className="flex flex-col items-center space-y-6 text-center w-full"
                    >
                        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <Check className="w-12 h-12 text-green-400" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-text mb-2">Analysis Complete</h2>
                            <p className="text-textMuted">{scanResult?.matched_schemes ? "Matching algorithm identified optimal programs" : "System Error"}</p>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4 mt-4">
                            <div className="glass-panel p-4 rounded-xl text-center">
                                <p className="text-sm font-mono text-textMuted">Total Matched</p>
                                <p className="text-3xl font-bold text-indigo-400">{scanResult?.total || 0}</p>
                            </div>
                            <div className="glass-panel p-4 rounded-xl text-center">
                                <p className="text-sm font-mono text-textMuted">Status</p>
                                <p className="text-xl font-bold text-teal-400 mt-2">{scanResult?.status === 'success' ? 'Validated' : 'Failed'}</p>
                            </div>
                        </div>


                        <button
                            onClick={onReset}
                            className="mt-6 text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                        >
                            Reset Terminal
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

// utility for progress display without causing bugs in compilation above
const minAmount = (p) => p;
