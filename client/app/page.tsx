'use client';

import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";
import HistoryComponent from "./components/history";
import { MessageSquare, History } from "lucide-react";
import * as React from "react";

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<'chat' | 'history'>('chat');

  return (
    <main className="flex-1 flex flex-col md:flex-row w-full bg-[#0a0a0a] text-slate-100 overflow-hidden relative z-0">
      {/* Ambient background glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] w-[40%] bg-blue-900/5 rounded-full blur-[120px]" />
      </div>

      <div className="flex w-full h-full z-10 flex-col md:flex-row overflow-hidden">
        {/* Sidebar / Upload Area */}
        <aside className="w-full md:w-[320px] lg:w-[380px] border-b md:border-b-0 md:border-r border-white/10 bg-black/40 backdrop-blur-xl p-5 flex flex-col gap-5 shadow-2xl relative z-30 flex-shrink-0 max-h-[40vh] md:max-h-full">
          <div className="space-y-3 overflow-y-auto pr-1">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Context</h2>
            <FileUploadComponent />
          </div>
          
          <div className="mt-auto hidden md:block pt-4 border-t border-white/5 flex-shrink-0">
             <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600">
               <div className="w-1 h-1 rounded-full bg-slate-600"></div>
               Secure Local Storage
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative h-full min-h-0 overflow-hidden bg-black/10">
            {/* Secondary Header (Tabs) */}
            <header className="h-14 border-b border-white/10 bg-[#121212] flex items-center px-4 justify-between flex-shrink-0 z-40">
                <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
                     {/* Tab buttons */}
                     <button
                        onClick={() => setActiveTab('chat')}
                        className={`
                          flex items-center gap-2 px-4 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200
                          ${activeTab === 'chat' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }
                        `}
                     >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat
                     </button>
                     <button
                        onClick={() => setActiveTab('history')}
                        className={`
                          flex items-center gap-2 px-4 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200
                          ${activeTab === 'history' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }
                        `}
                     >
                        <History className="w-3.5 h-3.5" />
                        History
                     </button>
                </div>
                
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 uppercase">
                   <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                   Ready
                </div>
            </header>
            
            {/* Content Container */}
            <div className="flex-1 overflow-hidden relative min-h-0 z-10">
                {activeTab === 'chat' ? <ChatComponent /> : <HistoryComponent />}
            </div>
        </div>
      </div>
    </main>
  );
}
