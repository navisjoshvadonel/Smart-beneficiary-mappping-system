import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../services/api';

export const AuthPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            let res;
            if (isLogin) {
                res = await AuthService.login(formData.email, formData.password);
            } else {
                res = await AuthService.register(formData.email, formData.password, formData.fullName);
            }

            if (res.status === 'success') {
                localStorage.setItem('sbms_user', JSON.stringify(res.user));
                navigate('/dashboard');
            } else {
                setError(res.message || "Authentication failed");
            }
        } catch (err) {
            setError("Server connection error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setError(null);
            setIsLoading(true);
            const decoded = jwtDecode(credentialResponse.credential);
            const res = await AuthService.googleAuth(decoded.email, decoded.name);

            if (res.status === 'success') {
                localStorage.setItem('sbms_user', JSON.stringify(res.user));
                navigate('/dashboard');
            } else {
                setError(res.message || "Google Authentication failed");
            }
        } catch (err) {
            setError("Server connection error during Google sign-in");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-background pointer-events-none" />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-accent-gradient opacity-10 blur-[120px] pointer-events-none"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-accent-gradient opacity-10 blur-[100px] pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="glass-card w-full max-w-md p-8 md:p-10 relative z-10 mx-4"
            >
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-12 h-12 bg-accent-gradient rounded-xl mb-4 shadow-[0_0_20px_rgba(106,0,255,0.4)] flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V8l7-5 7 5v13M9 21V12h6v9" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-accent-gradient">BenefitBridge</h1>
                    <h2 className="text-xl font-bold text-text mt-4">{isLogin ? 'Welcome back 👋' : 'Create an Account ✨'}</h2>
                    <p className="text-sm text-textMuted mt-1">{isLogin ? 'Sign in to check your eligible schemes' : 'Register to unlock your full scheme footprint'}</p>
                </div>

                {/* Google OAuth Button */}
                <div className="flex justify-center mb-6 w-full relative z-20">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Sign-In was cancelled or failed.')}
                        useOneTap
                        shape="pill"
                        theme="outline"
                        text={isLogin ? "signin_with" : "signup_with"}
                    />
                </div>

                <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-xs text-textMuted tracking-wider font-semibold">OR</span>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
                        {error}
                    </motion.div>
                )}

                <form className="space-y-4" onSubmit={handleFormSubmit}>
                    <AnimatePresence mode="popLayout">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-1.5"
                            >
                                <label className="text-xs font-semibold text-text uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Your official name"
                                    className="w-full px-4 py-3 glass-panel border border-white/20 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-text placeholder-textMuted text-sm"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text uppercase tracking-wider ml-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 glass-panel border border-white/20 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-text placeholder-textMuted text-sm"
                        />
                    </div>

                    <div className="space-y-1.5 relative">
                        <label className="text-xs font-semibold text-text uppercase tracking-wider ml-1">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Your password"
                            className="w-full px-4 py-3 glass-panel border border-white/20 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-text placeholder-textMuted text-sm"
                        />
                        {isLogin && (
                            <div className="flex justify-end mt-2">
                                <a href="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-8 py-3.5 bg-accent-gradient rounded-xl font-bold text-white shadow-[0_0_20px_rgba(106,0,255,0.3)] hover:shadow-[0_0_25px_rgba(106,0,255,0.5)] transition-shadow flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        <span>{isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
                        {!isLoading && (
                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-textMuted">
                        {isLogin ? "Don't have an account?" : "Already registered?"} {' '}
                        <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-400 font-bold hover:text-indigo-300">
                            {isLogin ? "Create one today" : "Sign in here"}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
