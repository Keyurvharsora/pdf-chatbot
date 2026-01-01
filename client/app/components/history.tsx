'use client';

import { useUser } from '@clerk/nextjs';
import { MessageSquare, Trash2, Clock } from 'lucide-react';
import * as React from 'react';

import Loader from './loader';
import { API_BASE_URL } from '@/lib/api';


interface Conversation {
  id: number;
  user_id: string;
  title: string;
  type: 'chat' | 'summary';
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  documents: string | null;
  created_at: string;
}

const HistoryComponent: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<number | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isLoaded && user?.id) {
      fetchConversations();
    }
  }, [user?.id, isLoaded]);

  const fetchConversations = async () => {
    if (!user?.id) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/conversations/${user.id}`);

      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`);

      const data = await res.json();
      setMessages(data);
      setSelectedConversation(conversationId);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId: number) => {
    try {
      await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {

        method: 'DELETE'
      });
      setConversations(conversations.filter(c => c.id !== conversationId));
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const formatDate = (dateString: string) => {
    // If the string doesn't end with Z and doesn't contain a timezone, 
    // it was likely stored in UTC by SQLite
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // This will use the browser's local timezone (IST for you)
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Please sign in to view history</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      {/* Conversations List */}
      <div className="w-[340px] border-r border-white/10 bg-black/20 flex flex-col h-full">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Conversations History
            </h2>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {conversations.length} Items
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 p-8 space-y-4">
              <div className="p-4 rounded-full bg-white/5">
                <MessageSquare className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-medium text-center">No history documented yet</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`
                    group relative p-4 rounded-2xl cursor-pointer transition-all duration-300
                    ${selectedConversation === conv.id 
                      ? 'bg-blue-600/10 border border-blue-500/30 shadow-lg shadow-blue-500/5' 
                      : 'hover:bg-white/5 border border-transparent'
                    }
                  `}
                  onClick={() => fetchMessages(conv.id)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${selectedConversation === conv.id ? 'text-blue-400' : 'text-slate-200'}`}>
                          {conv.title}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-500/70" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <span className={`
                            px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter
                            ${conv.type === 'summary' 
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }
                        `}>
                            {conv.type}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-600" />
                          <p className="text-[10px] font-medium text-slate-500">
                            {formatDate(conv.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages Display */}
      <div className="flex-1 flex flex-col">
        {selectedConversation === null ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the list to view messages</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="p-4 rounded-full bg-white/5 mb-4">
              <MessageSquare className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-medium">Empty Conversation</p>
            <p className="text-xs opacity-60">This chat doesn't contain any messages yet.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[75%] rounded-2xl p-4 shadow-lg
                    ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white/10 text-slate-100 rounded-bl-none border border-white/5'
                    }
                  `}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryComponent;
