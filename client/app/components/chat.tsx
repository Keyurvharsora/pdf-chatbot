'use client';

import { Button } from '@/components/ui/button';
import { Send, FileText, Bot, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import * as React from 'react';

import Loader from './loader';
import { API_BASE_URL } from '@/lib/api';


interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}

interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [currentConversationId, setCurrentConversationId] = React.useState<number | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Create a new conversation when component mounts
  React.useEffect(() => {
    if (isLoaded && user?.id && !currentConversationId) {
      createNewConversation();
    }
  }, [user?.id, isLoaded]);

  const createNewConversation = async () => {
    if (!user?.id) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: 'New Conversation'
        })
      });
      const conversation = await res.json();
      setCurrentConversationId(conversation.id);
      setMessages([]);
    } catch (err) {
      console.error('Error creating conversation:', err);
    }
  };

  const handleChatMessage = async () => {
    if (!message.trim() || !user?.id) return;

    // Create conversation if it doesn't exist
    let conversationId = currentConversationId;
    if (!conversationId) {
      try {
        const res = await fetch('http://localhost:8000/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            title: message.substring(0, 50) // Use first part of message as title
          })
        });
        const conversation = await res.json();
        conversationId = conversation.id;
        setCurrentConversationId(conversationId);
      } catch (err) {
        console.error('Error creating conversation:', err);
        return;
      }
    }

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    const currentMessage = message;
    setMessage('');
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          conversationId: conversationId
        })
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data?.message, documents: data?.docs },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
          ...prev, 
          { role: 'assistant', content: "Sorry, I encountered an error connecting to the server. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
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
        <p className="text-slate-400">Please sign in to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent w-full">
       {/* Messages Area */}
       <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50 select-none">
                <Bot className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start chatting with your documents!</p>
             </div>
          )}
          
          {messages.map((msg, index) => (
             <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                    max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-lg backdrop-blur-sm 
                    ${msg.role === 'user' 
                       ? 'bg-blue-600 text-white rounded-br-none' 
                       : 'bg-white/10 text-slate-100 rounded-bl-none border border-white/5'
                    }
                `}>
                   <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>

                   {/* Docs */}
                   {msg.documents && msg.documents.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                         <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sources</div>
                         {msg.documents.map((doc, idx) => (
                           <div key={idx} className="flex items-start gap-2 text-xs bg-black/20 p-2 rounded hover:bg-black/30 transition-colors">
                              <FileText className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                              <div className="overflow-hidden">
                                 <p className="font-medium text-slate-300 truncate" title={doc.metadata?.source}>
                                     {doc.metadata?.source?.split(/[/\\]/).pop() || 'Unknown Source'}
                                 </p>
                                 <p className="text-slate-500">Page {doc.metadata?.loc?.pageNumber}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
          ))}

          {loading && (
             <div className="flex justify-start">
               <div className="bg-white/5 text-slate-300 rounded-2xl rounded-bl-none p-4 flex items-center gap-3 border border-white/5">
                  <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs font-medium">AI is thinking...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <div className="p-4 md:p-6 pt-0">
          <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-2 pl-6 shadow-2xl backdrop-blur-md focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
             <input
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleChatMessage()}
               placeholder="Ask questions about your PDF..."
               className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none py-2"
               disabled={loading}
             />
             <Button
                onClick={handleChatMessage}
                disabled={!message.trim() || loading}
                size="icon"
                className="rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg w-10 h-10 flex items-center justify-center shrink-0 disabled:bg-slate-700 disabled:text-slate-500"
             >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
             </Button>
          </div>
       </div>
    </div>
  );
};

export default ChatComponent;
