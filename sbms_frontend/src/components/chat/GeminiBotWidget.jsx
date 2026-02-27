import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { RobotAvatar } from './RobotAvatar';

export const GeminiBotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Namaskar! I am your AI Assistant for the Smart Beneficiary Mapping System. I can help you find government schemes you are eligible for, understand how to apply, or track your applications. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:8000/api/ai/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.text })
            });
            const data = await response.json();

            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || 'API Error');
            }

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: data.reply || "I processed your request, but the response was empty.",
                sender: 'bot'
            }]);

        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I'm currently unable to access my knowledge core. It seems my AI configuration (API key) is missing or invalid. Please check the backend settings.",
                sender: 'bot'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[80]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] glass-card flex flex-col overflow-hidden outline outline-1 outline-white/10 shadow-[0_0_30px_rgba(0,255,255,0.15)]"
                    >
                        {/* Header */}
                        <div className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between px-4">
                            <div className="flex items-center space-x-3">
                                <RobotAvatar isSpeaking={isTyping} isTyping={isTyping} />
                                <div>
                                    <h3 className="text-text font-bold text-sm tracking-wide flex items-center gap-1"><Sparkles className="w-3 h-3 text-indigo-400" /> SBMS Assistant</h3>
                                    <p className="text-xs text-emerald-400 flex items-center space-x-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        <span>Online & Ready to Help</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-textMuted hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                        ? 'bg-indigo-500 text-white rounded-tr-sm shadow-[0_4px_15px_rgba(99,102,241,0.3)]'
                                        : 'bg-white/10 text-text border border-white/5 rounded-tl-sm backdrop-blur-md'
                                        }`}>
                                        {/* Simple Markdown rendering placeholder */}
                                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 border border-white/5 rounded-2xl rounded-tl-sm p-4 backdrop-blur-md flex space-x-2">
                                        <motion.div className="w-2 h-2 bg-cyan-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                                        <motion.div className="w-2 h-2 bg-cyan-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                                        <motion.div className="w-2 h-2 bg-cyan-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-background/50 backdrop-blur-md">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="p-3 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300 rounded-xl border border-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full shadow-[0_0_25px_rgba(0,255,255,0.4)] flex items-center justify-center transition-all ${isOpen ? 'bg-indigo-600 border border-indigo-400' : 'bg-[#0F172A]'
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <div className="scale-75 translate-y-[3px]">
                        <RobotAvatar />
                    </div>
                )}
            </motion.button>
        </div>
    );
};
