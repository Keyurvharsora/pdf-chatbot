'use client';

import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";
import HistoryComponent from "./components/history";
import { MessageSquare, History } from "lucide-react";
import * as React from "react";

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<'chat' | 'history'>('chat');

  return (
    <main className="flex min-h-screen w-full bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Ambient background glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="flex w-full h-full z-10 flex-col md:flex-row">
        {/* Sidebar / Upload Area */}
        <aside className="w-full md:w-[350px] lg:w-[400px] border-b md:border-b-0 md:border-r border-white/10 bg-black/20 backdrop-blur-xl p-6 flex flex-col gap-8 shadow-2xl relative z-20">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center font-bold text-white">AI</div>
             <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
               PDF Chatbot
             </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Upload Context</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload your PDF documents here to provide context for the AI. Once uploaded, you can start chatting immediately.
            </p>
            <FileUploadComponent />
          </div>
          
          <div className="mt-auto hidden md:block pt-6 border-t border-white/5">
             <div className="text-xs text-slate-500 text-center">
               Supported formats: PDF (Max 10MB)
             </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative h-[calc(100vh-80px)] md:h-screen">
            {/* Header with tabs */}
            <header className="h-16 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center px-6 justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                     {/* Tab buttons */}
                     <button
                        onClick={() => setActiveTab('chat')}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                          ${activeTab === 'chat' 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }
                        `}
                     >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                     </button>
                     <button
                        onClick={() => setActiveTab('history')}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                          ${activeTab === 'history' 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }
                        `}
                     >
                        <History className="w-4 h-4" />
                        History
                     </button>
                </div>
                
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                   Online
                </span>
            </header>
            
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'chat' ? <ChatComponent /> : <HistoryComponent />}
            </div>
        </div>
      </div>
    </main>
  );
}
