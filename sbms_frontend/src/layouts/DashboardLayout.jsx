import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { GeminiBotWidget } from '../components/chat/GeminiBotWidget';

export const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col pl-[80px] transition-all duration-300">
                <TopNav />
                <main className="flex-1 overflow-x-hidden overflow-y-auto relative">
                    {/* Global ambient light sources */}
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-gradient opacity-10 blur-[150px] rounded-full pointer-events-none fixed" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-gradient opacity-10 blur-[150px] rounded-full pointer-events-none fixed" />
                    <div className="p-8 relative z-10 min-h-full">
                        {children}
                    </div>
                </main>
            </div>
            {/* Global Gemini Bot */}
            <GeminiBotWidget />
        </div>
    );
};
