import React from 'react';
import { motion } from 'framer-motion';

export const RobotAvatar = ({ isSpeaking = false, isTyping = false }) => {
    // A cute, futuristic SVG robot
    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Outer Glow / Halo */}
            <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-400"
                animate={{
                    scale: isSpeaking ? [1, 1.2, 1] : 1,
                    opacity: isSpeaking ? [0.5, 0, 0.5] : 0.2
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Base Head */}
            <motion.div
                className="relative z-10 w-12 h-10 bg-[#0F172A] border-2 border-cyan-400 rounded-2xl flex flex-col items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                animate={{
                    y: isSpeaking ? [0, -4, 0] : [0, -2, 0]
                }}
                transition={{ duration: isSpeaking ? 0.4 : 2, repeat: Infinity }}
            >
                {/* Antenna */}
                <div className="absolute -top-3 w-1 h-3 bg-cyan-400">
                    <motion.div
                        className="absolute -top-1.5 -left-1 w-3 h-3 bg-indigo-500 border border-cyan-400 rounded-full"
                        animate={{
                            backgroundColor: isTyping ? ['#6366f1', '#22d3ee', '#6366f1'] : '#6366f1'
                        }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    />
                </div>

                {/* Eyes container */}
                <div className="flex space-x-2 mt-1">
                    {/* Left Eye */}
                    <motion.div
                        className="w-3 h-2 bg-cyan-300 rounded-full"
                        animate={{
                            scaleY: isSpeaking ? [1, 0.4, 1] : [1, 0.1, 1],
                            opacity: [1, 0.8, 1]
                        }}
                        transition={{
                            duration: isSpeaking ? 0.3 : 3,
                            repeat: Infinity,
                            repeatDelay: isSpeaking ? 0 : 2
                        }}
                    />
                    {/* Right Eye */}
                    <motion.div
                        className="w-3 h-2 bg-cyan-300 rounded-full"
                        animate={{
                            scaleY: isSpeaking ? [1, 0.4, 1] : [1, 0.1, 1],
                            opacity: [1, 0.8, 1]
                        }}
                        transition={{
                            duration: isSpeaking ? 0.3 : 3,
                            repeat: Infinity,
                            repeatDelay: isSpeaking ? 0 : 2
                        }}
                    />
                </div>

                {/* Mouth Line */}
                <motion.div
                    className="w-4 h-0.5 bg-cyan-400 mt-1.5 rounded-full"
                    animate={{
                        width: isSpeaking ? [16, 8, 16] : 12,
                        height: isSpeaking ? [2, 6, 2] : 2,
                        borderRadius: isSpeaking ? "8px" : "2px"
                    }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                />
            </motion.div>
        </div>
    );
};
