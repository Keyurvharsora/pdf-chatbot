'use client';

import { useUser } from '@clerk/nextjs';
import { MessageSquare, Trash2, Clock } from 'lucide-react';
import * as React from 'react';

import Loader from './loader';

interface Conversation {
  id: number;
  user_id: string;
  title: string;
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
      const res = await fetch(`http://localhost:8000/conversations/${user.id}`);
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/conversations/${conversationId}/messages`);
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
      await fetch(`http://localhost:8000/conversations/${conversationId}`, {
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
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
      <div className="w-80 pb-10 border-r border-white/10 bg-black/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-slate-200">Chat History</h2>
          <p className="text-xs text-slate-400 mt-1">{conversations.length} conversations</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4">
              <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm text-center">No conversations yet</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`
                    group relative p-3 rounded-lg cursor-pointer transition-all
                    ${selectedConversation === conv.id 
                      ? 'bg-blue-600/20 border border-blue-500/30' 
                      : 'hover:bg-white/5 border border-transparent'
                    }
                  `}
                  onClick={() => fetchMessages(conv.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {conv.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <p className="text-xs text-slate-500">
                          {formatDate(conv.updated_at)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
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
                  {msg.documents && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-400">
                      <p>📄 Sources attached</p>
                    </div>
                  )}
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
