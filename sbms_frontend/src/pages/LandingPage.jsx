import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, CheckCircle2, Search, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { SchemeMatcher } from '../components/SchemeMatcher';
import { EligibilityProcessingService } from '../services/api';

export const LandingPage = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [uid, setUid] = useState('');

    const handleScan = async () => {
        if (!uid) return;
        setIsScanning(true);
        try {
            const response = await EligibilityProcessingService.scanSchemes(uid);
            setScanResult(response);
        } catch (error) {
            console.error(error);
            setScanResult({ error: true });
        } finally {
            setIsScanning(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <div className="relative max-w-7xl mx-auto min-h-[80vh] flex flex-col justify-center">

            {/* AI Recommendation Pulse background */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-gradient rounded-full blur-[100px] pointer-events-none"
            />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full grid lg:grid-cols-2 gap-12 items-center relative z-10"
            >
                {/* Left Column: Copy */}
                <div className="space-y-8">
                    <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium tracking-wide text-indigo-400">SBMS AI INTELLIGENCE V4.2</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-bold leading-tight">
                        National Welfare <br />
                        <span className="bg-clip-text text-transparent bg-accent-gradient">
                            Allocation Engine
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-xl text-textMuted max-w-xl leading-relaxed">
                        Neural matchmaking system connecting citizens to government schemes with 99.8% precision. Authenticate identity to initialize personal risk and allocation sweep.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <ShieldCheck className="w-5 h-5 text-green-400" />
                            <span className="text-sm text-textMuted">End-to-End Encrypted</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span className="text-sm text-textMuted">Aadhaar Verified</span>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: AI Scanner Card / Scheme Matcher Component */}
                <motion.div variants={itemVariants} className="relative">
                    <AnimatePresence mode="wait">
                        {!isScanning && !scanResult ? (
                            <motion.div
                                key="init"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                className="glass-card p-8 lg:p-12 border border-white/20 select-none relative overflow-hidden group"
                            >
                                {/* Hover Elevation Lift effect applied via Tailwind + Framer */}
                                <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

                                <div className="text-center space-y-8 relative z-10">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center glow-ring">
                                        <Fingerprint className="w-12 h-12 text-indigo-400" />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-text">Identity Authentication</h3>
                                        <p className="text-textMuted">Submit UID to commence AI matching protocol</p>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={uid}
                                            onChange={(e) => setUid(e.target.value)}
                                            placeholder="Enter 12-Digit Aadhaar UID"
                                            className="w-full text-center tracking-widest text-lg py-4 glass-panel border border-white/20 rounded-xl bg-transparent focus:outline-none focus:border-indigo-500 transition-colors"
                                            maxLength={12}
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleScan}
                                        disabled={!uid}
                                        className="w-full py-4 bg-accent-gradient rounded-xl font-bold text-white shadow-[0_0_20px_rgba(106,0,255,0.4)] flex items-center justify-center space-x-2 disabled:opacity-50"
                                    >
                                        <Search className="w-5 h-5" />
                                        <span>INITIALIZE AI SCAN</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <SchemeMatcher key="matcher" isScanning={isScanning} scanResult={scanResult} onReset={() => setScanResult(null)} />
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
};
