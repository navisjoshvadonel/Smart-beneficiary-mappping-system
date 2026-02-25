import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Search, FileText, AlertCircle, UserCircle, PieChart, Inbox, Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const citizenItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Search, label: 'Search Schemes', path: '/search' },
    { icon: FileText, label: 'My Applications', path: '/applications' },
    { icon: AlertCircle, label: 'My Grievances', path: '/grievances' },
    { icon: UserCircle, label: 'Edit Profile', path: '/profile' },
];

const adminItems = [
    { icon: PieChart, label: 'Platform Stats', path: '/analytics' },
    { icon: Inbox, label: 'Manage Grievances', path: '/admin-grievances' },
];

export const Sidebar = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [activePath, setActivePath] = useState('/dashboard');
    const [user, setUser] = useState({ full_name: 'Citizen', email: 'guest@sbms.gov' });
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('sbms_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('sbms_user');
        navigate('/');
    };

    return (
        <motion.aside
            initial={{ width: 80 }}
            animate={{ width: isHovered ? 260 : 80 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed left-0 top-0 h-screen glass-panel border-r border-white/10 z-50 flex flex-col pt-6 overflow-hidden"
        >
            <div className="flex items-center px-6 h-12 mb-8 whitespace-nowrap">
                <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                    <Menu className="w-5 h-5 text-white" />
                </div>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2, delay: isHovered ? 0.1 : 0 }}
                    className="ml-4 font-bold text-lg tracking-wider bg-clip-text text-transparent bg-accent-gradient"
                >
                    SBMS CORE
                </motion.span>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
                <nav className="px-4 space-y-1 mb-6">
                    {citizenItems.map((item) => {
                        const isActive = activePath === item.path;
                        return (
                            <button
                                key={item.label}
                                onClick={() => { setActivePath(item.path); navigate(item.path); }}
                                className={`w-full flex items-center px-2 py-3 rounded-xl relative group transition-all duration-300 ${isActive ? 'text-primary' : 'text-textMuted hover:text-text'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-accent-gradient opacity-10 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent-gradient rounded-r-md shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
                                )}

                                <div className="w-8 h-8 flex items-center justify-center shrink-0 relative z-10">
                                    <item.icon className="w-5 h-5" />
                                </div>

                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{
                                        opacity: isHovered ? 1 : 0,
                                        x: isHovered ? 0 : -10
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-4 font-medium whitespace-nowrap relative z-10"
                                >
                                    {item.label}
                                </motion.span>
                            </button>
                        );
                    })}
                </nav>

                <div className="px-6 mb-2">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="text-[10px] font-bold text-textMuted uppercase tracking-widest whitespace-nowrap"
                    >
                        ADMIN
                    </motion.p>
                </div>

                <nav className="px-4 space-y-1">
                    {adminItems.map((item) => {
                        const isActive = activePath === item.path;
                        return (
                            <button
                                key={item.label}
                                onClick={() => { setActivePath(item.path); navigate(item.path); }}
                                className={`w-full flex items-center px-2 py-3 rounded-xl relative group transition-all duration-300 ${isActive ? 'text-primary' : 'text-textMuted hover:text-text'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-accent-gradient opacity-10 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent-gradient rounded-r-md shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
                                )}

                                <div className="w-8 h-8 flex items-center justify-center shrink-0 relative z-10">
                                    <item.icon className="w-5 h-5" />
                                </div>

                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{
                                        opacity: isHovered ? 1 : 0,
                                        x: isHovered ? 0 : -10
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-4 font-medium whitespace-nowrap relative z-10"
                                >
                                    {item.label}
                                </motion.span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Profile / Sign Out Footer matching screenshot */}
            <div className={`p-4 border-t border-white/10 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 overflow-hidden shrink-0`}>
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                        <span className="text-indigo-400 font-bold text-sm">{(user.full_name || 'C')[0].toUpperCase()}</span>
                    </div>
                    <div className="truncate">
                        <p className="text-sm font-bold text-text truncate">{user.full_name}</p>
                        <p className="text-xs text-textMuted truncate">{user.email}</p>
                    </div>
                </div>
                <button onClick={handleSignOut} className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign out</span>
                </button>
            </div>

            {/* Bottom decorative pulse */}
            <div className="p-6">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div
                        className="absolute top-0 left-0 h-full w-1/3 bg-accent-gradient"
                        animate={{
                            x: ['-100%', '300%']
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </div>
            </div>
        </motion.aside>
    );
};
