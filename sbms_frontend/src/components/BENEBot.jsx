import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Sparkles, Mic, Volume2 } from 'lucide-react';

export const BENEBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I am BENE-Bot, your AI Welfare Assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });
            const data = await response.json();
            
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                text: data.reply || "I'm sorry, I couldn't process that.", 
                sender: 'bot' 
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                text: "Connection error. Please try again later.", 
                sender: 'bot' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Voice Synthesis
    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    // Voice Recognition (Basic Web Speech API)
    const toggleListen = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="glass-card mb-4 w-[350px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden border border-white/20 shadow-2xl"
                        style={{ backdropFilter: 'blur(16px)' }}
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-indigo-600/20 to-teal-600/20 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <Bot size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text text-sm">BENE-Bot AI</h3>
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-[10px] text-textMuted uppercase tracking-wider">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-textMuted hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                            : 'bg-white/10 text-text border border-white/5 rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                        {msg.sender === 'bot' && (
                                            <button 
                                                onClick={() => speak(msg.text)} 
                                                className="mt-2 block text-[10px] text-indigo-400 hover:text-indigo-300"
                                            >
                                                <Volume2 size={12} className="inline mr-1" /> Listen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <div className="flex gap-2">
                                <button 
                                    onClick={toggleListen}
                                    className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-textMuted hover:text-white'}`}
                                >
                                    <Mic size={18} />
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your question..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-text focus:outline-none focus:border-indigo-500/50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading}
                                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                    isOpen ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'
                }`}
            >
                {isOpen ? <Sparkles size={24} /> : <MessageSquare size={24} />}
            </motion.button>
        </div>
    );
};
