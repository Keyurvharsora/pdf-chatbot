'use client';

import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";
import SummaryComponent from "./components/summary";
import HistoryComponent from "./components/history";
import { MessageSquare, History, Sparkles, Layout } from "lucide-react";
import * as React from "react";

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<'chat' | 'summary' | 'history'>('chat');

  return (
    <main className="flex-1 flex flex-col md:flex-row w-full bg-[#0a0a10] text-slate-100 overflow-hidden relative font-sans">
      {/* Premium Ambient Overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="flex w-full h-full z-10 flex-col md:flex-row overflow-hidden">
        {/* Sidebar / Upload Area - Premium Glassmorphism */}
        <aside className="w-full md:w-[320px] lg:w-[380px] border-b md:border-b-0 md:border-r border-white/10 bg-black/40 backdrop-blur-2xl p-6 flex flex-col gap-8 shadow-2xl relative z-30 flex-shrink-0 max-h-[40vh] md:max-h-full">
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Context Source</h2>
            </div>
            <FileUploadComponent />
          </div>
          
          <div className="mt-auto hidden md:block pt-6 border-t border-white/5 flex-shrink-0">
             <div className="flex items-center justify-center gap-3 text-[11px] font-medium text-slate-500">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
               Advanced VAPT Engine Active
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative h-full min-h-0 overflow-hidden bg-black/20">
            {/* Nav Header - Modern Tab System */}
            <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center px-6 justify-between flex-shrink-0 z-40">
                <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-sm">
                     <button
                        onClick={() => setActiveTab('chat')}
                        className={`
                          flex items-center gap-2.5 px-6 py-2 rounded-xl font-bold text-xs transition-all duration-300 relative group
                          ${activeTab === 'chat' 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }
                        `}
                     >
                        <MessageSquare className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === 'chat' ? 'animate-pulse' : ''}`} />
                        Chat
                     </button>
                     <button
                        onClick={() => setActiveTab('summary')}
                        className={`
                          flex items-center gap-2.5 px-6 py-2 rounded-xl font-bold text-xs transition-all duration-300 relative group
                          ${activeTab === 'summary' 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }
                        `}
                     >
                        <Sparkles className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === 'summary' ? 'animate-pulse' : ''}`} />
                        Summary
                     </button>
                     <button
                        onClick={() => setActiveTab('history')}
                        className={`
                          flex items-center gap-2.5 px-6 py-2 rounded-xl font-bold text-xs transition-all duration-300 relative group
                          ${activeTab === 'history' 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }
                        `}
                     >
                        <History className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === 'history' ? 'animate-pulse' : ''}`} />
                        History
                     </button>
                </div>
            </header>
            
            {/* Content Container with Smooth Transitions */}
            <div className="flex-1 overflow-hidden relative min-h-0 z-10">
                {activeTab === 'chat' && <ChatComponent />}
                {activeTab === 'summary' && <SummaryComponent />}
                {activeTab === 'history' && <HistoryComponent />}
            </div>
        </div>
      </div>
    </main>
  );
}
