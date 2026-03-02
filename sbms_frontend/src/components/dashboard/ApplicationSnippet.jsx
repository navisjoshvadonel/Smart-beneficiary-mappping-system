import React from 'react';
import { FileText } from 'lucide-react';

export const ApplicationSnippet = ({ applications, viewAllLink = "#" }) => {
    return (
        <div className="glass-card p-5 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-text">Applications</h3>
                </div>
                <a href={viewAllLink} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium tracking-wide">View All</a>
            </div>

            <div className="space-y-3 relative z-10">
                {applications.length === 0 ? (
                    <p className="text-xs text-textMuted px-1">No applications pending.</p>
                ) : (
                    applications.map(app => (
                        <div key={app.id} className="flex flex-col space-y-2 p-3 bg-white/5 rounded-xl border border-white/5 mx-1">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-semibold text-text leading-tight">{app.name}</h4>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-textMuted">{app.appliedOn}</span>
                                <span className={`px-2 py-0.5 border text-[10px] font-bold tracking-wider rounded-md ${app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    app.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        app.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            'bg-white/10 text-textMuted border-white/10'
                                    }`}>
                                    {app.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
