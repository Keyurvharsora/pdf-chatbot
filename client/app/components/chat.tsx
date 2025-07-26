'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as React from 'react';

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
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleChatMessage = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/chat?message=${message}`);
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data?.message, documents: data?.docs },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 pb-28 px-4 pt-6">
      <div className='text-black mb-2'>Type the message to start your conversations</div>
      {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="loader mb-2" style={{ width: 48, height: 48, display: "flex", justifyContent: "center", alignItems: "center", border: '6px solid #3b82f6', borderTop: '6px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span className="text-blue-600 font-semibold">Loading...</span>
            </div>
          </div>
        )}
      <div className="max-w-3xl mx-auto space-y-4 relative">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow-md whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-100 text-black self-end text-right'
                : 'bg-white text-gray-800'
            }`}
          >
            <p className="mb-2 font-medium capitalize">{msg.role === "user" && "You"}</p>
            <p>{msg.content}</p>

            {msg.documents && msg.documents.length > 0 && (
              <div className="mt-3 text-sm text-gray-600 border-t pt-2">
                <p className="font-semibold mb-1">Referenced Docs:</p>
                {msg.documents.map((doc, idx) => (
                  <div key={idx} className="mb-2">
                    <p className="text-gray-700">
                      <strong>Source:</strong>{' '}
                      {doc.metadata?.source?.split('\\').pop()}
                    </p>
                    <p>
                      <strong>Page:</strong> {doc.metadata?.loc?.pageNumber}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fixed input bar */}
      <div className="fixed bottom-4 left-0 w-full flex justify-center px-4">
        <div className= "px-4 py-2 flex gap-3 items-center max-w-2xl w-full">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow h-12 bg-gray-100 text-black rounded-full px-4 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleChatMessage();
            }}
          />
          <Button
            onClick={handleChatMessage}
            disabled={!message.trim()}
            className="h-12 w-25 px-5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </Button>
        </div>
      </div>
      {/* Loader spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatComponent;
