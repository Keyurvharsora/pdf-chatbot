'use client';

import * as React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative flex items-center justify-center">
                {/* Outer spinning ring */}
                <div className="w-16 h-16 rounded-full border-2 border-slate-800/30 border-t-purple-500 animate-spin"></div>
                
                {/* Second reverse spinning ring */}
                <div className="absolute w-12 h-12 rounded-full border-2 border-slate-800/30 border-b-blue-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                
                {/* Static glowing core */}
                <div className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 blur-[4px] animate-pulse"></div>
                
                {/* Small sharp center dot */}
                <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)]"></div>
            </div>
            
            <style jsx>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
            `}</style>
        </div>
    );
};

export default Loader;
