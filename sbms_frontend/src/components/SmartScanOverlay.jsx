import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Database, Cpu, Search, Sparkles } from 'lucide-react';

export const SmartScanOverlay = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Initializing Deep Scan...');
    const [show, setShow] = useState(true);

    const stages = [
        { p: 10, s: 'Accessing National Health Database...' },
        { p: 30, s: 'Verifying Income Documentation...' },
        { p: 50, s: 'NLP Analysis of Profile Metadata...' },
        { p: 70, s: 'Running AI Eligibility Engine...' },
        { p: 90, s: 'Matching with 300+ State Schemes...' },
        { p: 100, s: 'Mapping Complete.' }
    ];

    useEffect(() => {
        let currentStage = 0;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setShow(false);
                        onComplete();
                    }, 1000);
                    return 100;
                }
                
                if (prev >= stages[currentStage].p && currentStage < stages.length - 1) {
                    currentStage++;
                    setStatus(stages[currentStage].s);
                }
                
                return prev + 1;
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
                >
                    <div className="max-w-md w-full p-8 text-center space-y-8">
                        {/* Scanning Animation */}
                        <div className="relative w-48 h-48 mx-auto">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-dashed border-indigo-500/30 rounded-full"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border border-teal-500/20 rounded-full"
                            />
                            
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Cpu size={48} className="text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
                                </motion.div>
                            </div>

                            {/* Scanning bar */}
                            <motion.div
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_10px_rgba(129,140,248,1)] z-10"
                            />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Smart Scan Active</h2>
                            <p className="text-indigo-300 font-mono text-xs">{status}</p>
                            
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-teal-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-white/40 text-[10px] font-mono">{progress}% DATA_LOADED</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[ShieldCheck, Database, Search].map((Icon, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                                    <Icon size={20} className="text-teal-400" />
                                    <span className="text-[8px] text-textMuted uppercase font-bold tracking-tighter">Verified</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
