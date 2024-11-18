import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useMessages } from '../../hooks/useMessages';
import { useStore } from '../../store/useStore';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Message } from '../../lib/firebase/messages';
import { ArrowLeft, MoreVertical } from 'lucide-react';

interface ThreadState {
  title?: string;
  type?: 'ask' | 'offer';
  kiPoints?: number;
  author?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export default function MessageThread() {
  const { id = '' } = useParams();
  const location = useLocation();
  const threadState = location.state as ThreadState;
  const { messages, loading, error, sendMessage } = useMessages(id);
  const user = useStore(state => state.user);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user) return;

    try {
      await sendMessage({
        threadId: id,
        content: content.trim(),
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        recipientId: threadState?.author?.id,
        recipientName: threadState?.author?.name,
        recipientAvatar: threadState?.author?.avatar,
        type: 'text',
        metadata: threadState?.type ? {
          offerId: id,
          offerTitle: threadState.title,
          kiPoints: threadState.kiPoints
        } : undefined
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const renderDateDivider = (message: Message, index: number) => {
    if (index === 0) return true;
    
    const prevMessage = messages[index - 1];
    const prevDate = new Date(prevMessage.timestamp).toDateString();
    const currentDate = new Date(message.timestamp).toDateString();
    
    return prevDate !== currentDate;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          {threadState?.author && (
            <div className="flex items-center space-x-3">
              <img 
                src={threadState.author.avatar} 
                alt={threadState.author.name}
                className="h-10 w-10 rounded-full" 
              />
              <div>
                <h3 className="font-medium text-gray-900">{threadState.author.name}</h3>
                {threadState.type && (
                  <p className="text-sm text-gray-500">
                    {threadState.type === 'ask' ? 'Ask' : 'Offer'}: {threadState.title}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreVertical className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <React.Fragment key={message.id}>
            {renderDateDivider(message, index) && (
              <div className="flex items-center justify-center my-4">
                <div className="px-4 py-1 bg-gray-100 rounded-full">
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
            <MessageBubble
              content={message.content}
              timestamp={message.timestamp}
              isOwn={message.senderId === user?.id}
              status={message.status}
              avatar={message.senderAvatar}
              name={message.senderName}
              type={message.type}
            />
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={() => setIsTyping(true)}
        disabled={loading}
      />
    </div>
  );
}